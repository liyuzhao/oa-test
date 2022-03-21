const { app, BrowserWindow, ipcMain, globalShortcut }  = require("electron");
const path = require('path');
const url = require('url');


let allRendererWindow = [];

function createWindow() {

    const mainWindow = new BrowserWindow({
        width: 900, 
        height: 650,
        title: "模拟压测程序",
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            preload: path.join(app.getAppPath(), './preLoad.js')
        },
        show: true
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    setTimeout(() => {
        mainWindow.setTitle('模拟压测程序');
        
    }, 2000);

    
    // Open the DevTools
    mainWindow.webContents.openDevTools();

    mainWindow.on('close', function() {
        me.mainWindow = null;
    });

    // mainWindow.webContents.on('did-finish-load', () => {

    // });

    mainWindow.on("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.webContents.on("before-input-event", (event, input) => {
        // let contents = mainWindow.webContents;
        if((input.meta || input.control ) && input.shift && input.key.toLowerCase() === 'r') {
            mainWindow.webContents.reload();
            event.preventDefault();
            return;
        }

        if((input.meta || input.control) && input.shift && input.key.toLowerCase() === 'i') {
            mainWindow.openDevTools();
            event.preventDefault();
            return;
        }
    });

    // mainWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, 'index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));


    ipcMain.on('open-exteral-url', (event, targetUrl, targetTitle) => {
        event.preventDefault();
        const mediaWindow = new BrowserWindow({
            width: 800,
            height: 600,
            title: targetTitle || "渲染窗口",
            show: true,
            webPreferences: {
                webSecurity: false,
                preload: path.join(app.getAppPath(), './rendererPreLoad.js')
            }
        });

        mediaWindow.webContents.session.setCertificateVerifyProc((request, callback) => {
            callback(0);
        });

        mediaWindow.webContents.on("before-input-event", (event, input) => {
            if((input.meta || input.control) && input.shift && input.key.toLowerCase() === 'i') {
                mediaWindow.openDevTools();
                event.preventDefault();
                return;
            }
        });

        mediaWindow.on('closed', (event) => {
            // console.log('mediaWindow closed.');
        });

        mediaWindow.on('did-finish_load', () => {
            mediaWindow.setTitle(targetTitle);
        });

        mediaWindow.loadURL(targetUrl);

        setTimeout(() => {
            console.log("start======", targetTitle)
            mediaWindow.setTitle(targetTitle);
            console.log("end======")
        }, 2000);

        allRendererWindow.push(mediaWindow);

    });

    ipcMain.on('close-all-exteral-window', (event) => {
        let rendererWindow = allRendererWindow.pop();
        while(rendererWindow) {
            // console.log('rendererWindow:', rendererWindow);
            // if(!rendererWindow.isDestroyed()) {
            //     rendererWindow.destory();
            // }
            rendererWindow.close();
            rendererWindow = allRendererWindow.pop();
            
        }
        console.log('allRendererWindow is cleaned.');
        allRendererWindow = [];
    });
}

app.whenReady().then(()=>{
    createWindow();
});

app.on('window-all-closed', function() {
    if(process.platform !== 'darwin') {
        app.quit();
    }
});

// app.on('activate', function (){
//     if(mainWindow == null) {
//         createWindow();
//     }
// })


app.on("certificate-error", (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
});

app.on("select-client-certificate", (event, webContents, url, list, callback) => {
    event.preventDefault();
    callback(list[0]);
});


// 忽略证书相关错误
app.commandLine.appendSwitch("ignore-certificate-errors");

