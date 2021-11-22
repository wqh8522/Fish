import fa from "element-ui/src/locale/lang/fa";

require('@electron/remote/main').initialize();


import {app, Menu, Tray, BrowserWindow,dialog,shell} from 'electron'
import '../renderer/store'
const { registProviderWindow, unRegistProviderWindow } = require('electron-wpc');
const ipcMain = require('electron').ipcMain;
const TAG = 'tag_for_win_provider';

const path = require('path');
import { autoUpdater } from "electron-updater";

import el from "element-ui/src/locale/lang/el";

let isDev = true;

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    isDev = false;
    global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let leeksMiniWin;
let tray;

const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`


app.on('ready', ()=> {
    createTray();
    listenerMsg();
    createWindow();
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// app.on('activate', () => {
//     if (mainWindow === null) {
//         createWindow()
//     }
// })

function createWindow() {
    if (mainWindow !== undefined && mainWindow !== null && typeof (mainWindow) != undefined) {
        return
    }
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 563,
        width: 400,
        useContentSize: true,
        autoHideMenuBar: true,
        skipTaskbar: true,
        webPreferences: {//网页功能的设置
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

function listenerMsg(){

    ipcMain.on('asynchronous-message', (event, arg, param) => {
        switch (arg) {
            case 'leeks-right-open':
                mainWindow.setSize(800, 600, true);
                break;
            case 'leeks-right-close':
                mainWindow.setSize(400, 563, true);
                break;
            case 'leeks-win-openTop':
                if (!mainWindow.isAlwaysOnTop()) {
                    mainWindow.setAlwaysOnTop(true);
                    BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', 'yes');
                }
                break;
            case 'leeks-win-closeTop':
                if (mainWindow.isAlwaysOnTop()) {
                    mainWindow.setAlwaysOnTop(false);
                    BrowserWindow.getFocusedWindow().webContents.send('alwaysOnTop', 'no');
                }
                break;
            case 'leeks-win-transparency':
                mainWindow.setOpacity(param)
                break;
        }
    });

    ipcMain.on('openStockMiniWindow', e => {
        if (!leeksMiniWin){
            openCalendarWindow();
            leeksMiniWin.show();
            mainWindow.focus();
        } else {

        }
    });

    ipcMain.on("closeStockMiniWindow", e => {
        try {
            if (leeksMiniWin !== null) {
                leeksMiniWin.close();
                leeksMiniWin.destroy();
                leeksMiniWin = undefined
            }
        } catch (e) {
            console.log(e);
        }
    });

}


// 创建calendar窗口方法
function openCalendarWindow() {
    leeksMiniWin = new BrowserWindow({
        width: 189, //悬浮窗口的宽度 比实际DIV的宽度要多2px 因为有1px的边框
        height: 24, //悬浮窗口的高度 比实际DIV的高度要多2px 因为有1px的边框
        // type: 'toolbar',    //创建的窗口类型为工具栏窗口
        frame: false,   //要创建无边框窗口
        // resizable: false, //禁止窗口大小缩放
        show: false,    //先不让窗口显示
        alwaysOnTop: true,  //窗口是否总是显示在其他窗口之前
        // parent: mainWindow, // win是主窗口
        useContentSize: true,
        transparent: true,
        backgroundColor: '#66FFFFFF',
        movable: true,
        // roundedCorners: false,  // mac下圆角显示
        maximizable: false,
        minimizable: false,
        // titleBarStyle: 'hidden',
        skipTaskbar: true,
        webPreferences: {//网页功能的设置
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    // leeksMiniWin.setIgnoreMouseEvents(true)
    leeksMiniWin.loadURL(winURL + '#/StockMiniWinPage');
    leeksMiniWin.on('closed', () => {
        leeksMiniWin = undefined
        unRegistProviderWindow(TAG)
    });
    registProviderWindow(leeksMiniWin, TAG);
    require("@electron/remote/main").enable(leeksMiniWin.webContents)
    // leeksMiniWin.setOpacity(0.1)
}

function createTray() {
    const menubarLogo = process.platform === 'darwin' ? `${__static}/macTray.png` : `${__static}/winTray.png`
    tray = new Tray(menubarLogo)
    const menuList = [{
        label: '韭菜模式',
        click() {
            createWindow();
        }
    },{
        type: "separator"
    }, {
        label: '检查更新',
        click() {
           if (autoUpdater.checkForUpdatesAndNotify()) {
               const options = {
                   type: 'info',
                   title: '检查更新',
                   message: "发现新版本，是否更新？",
                   buttons: ['是', '否'],
                   icon: `${__static}/logo.png`
               }
               dialog.showMessageBox(null, options).then(result => {
                   if (result.response === 0) {
                       autoUpdater.downloadUpdate();
                   }
               }).catch(err => {
                   console.log(err)
               })
           } else {
               const options = {
                   type: 'info',
                   title: '检查更新',
                   message: "当前为最新版本",
                   buttons: ['确认'],
                   icon: `${__static}/logo.png`
               }
               dialog.showMessageBox(options)
           }
        }
    },{
        // accelerator: 'CommandOrControl+Alt+X',
        label: '退出',
        click() {
            app.quit();
        }
    }]
    const contextMenu = Menu.buildFromTemplate(menuList)
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
}


