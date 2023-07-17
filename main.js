const path = require('path')
const {app, BrowserWindow} = require('electron');

const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform === 'darwin'; // is true or false

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

app.whenReady().then(() => {
    createMainWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    }) // This is for mac if the app is running and no windows are open it will open one
})

app.on('window-all-closed', () => {
    if (!isMac) app.quit()
})