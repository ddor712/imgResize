const path = require('path')
const os = require('os');
const fs = require ('fs');
const resizeImg = require('resize-img');
const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron');

process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin'; // is true or false

let mainWindow;
let aboutWindow;

// Creates the Main window
function createMainWindow(){
    mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width:isDev ? 1200 : 800,
        height:600,
        webPreferences: {
            contextIsolation:true,
            nodeIntegration:true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Open devtools if in dev env
    if(isDev){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// Create About Window
function createAboutWindow(){
    aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width:300,
        height:600
    });
    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// App is ready
app.whenReady().then(() => {
    createMainWindow()

    // Implement Menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    // Remove mainWindow from memory on close
    mainWindow.on('closed', () => (mainWindow = null))

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    }) // This is for mac if the app is running and no windows are open it will open one
})

const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu:[{
            label:'About',
            click: createAboutWindow
        }]
    }] : []),
    {
        role: 'fileMenu'
    },
    ...(!isMac ? [{
        label:'Help',
        submenu:[{
            label:'About',
            click: createAboutWindow
        }]
    }] : [])
];

// Respond to ipcRenderer resize
ipcMain.on('image:resize', (e,options) => {
    options.dest = path.join(os.homedir(), 'imageresizer');
    resizeImage(options)
});

// Resize the Image
async function resizeImage({ imgPath, width, height, dest }){
    try{
        const newPath = await resizeImg(fs.readFileSync(imgPath),{
            width:+width,
            height:+height
        })

        const filename = "rs_" + path.basename(imgPath);

        // Create dest folder if it doesnt exist
        if(!fs.existsSync(dest)){
            fs.mkdirSync(dest);
        }

        // Write file to dest
        fs.writeFileSync(path.join(dest, filename), newPath);

        // Send Success Message Back
        mainWindow.webContents.send('image:done');
        
        // Open the dest folder so they can see the image
        shell.openPath(dest);

    }catch(err){
        console.log(err);
    }
}

app.on('window-all-closed', () => {
    if (!isMac) app.quit()
})