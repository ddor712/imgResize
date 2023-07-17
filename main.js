const path = require('path')
const {app, BrowserWindow, Menu} = require('electron');

const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform === 'darwin'; // is true or false

// Creates the Main window
function createMainWindow(){
    const mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width:isDev ? 1200 : 800,
        height:600
    });

    // Open devtools if in dev env
    if(isDev){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// Create About Window
function createAboutWindow(){
    const aboutWindow = new BrowserWindow({
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

app.on('window-all-closed', () => {
    if (!isMac) app.quit()
})