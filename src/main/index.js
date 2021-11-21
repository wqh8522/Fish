import {app, BrowserWindow} from 'electron'
import '../renderer/store'
const { registProviderWindow, unRegistProviderWindow } = require('electron-wpc');
const ipcMain = require('electron').ipcMain;
const TAG = 'tag_for_win_provider';

import el from "element-ui/src/locale/lang/el";

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let leeksMiniWin;

const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 563,
        width: 370,
        useContentSize: true,
        autoHideMenuBar: true,
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


    ipcMain.on('asynchronous-message', (event, arg, param) => {
        switch (arg) {
            case 'leeks-right-open':
                mainWindow.setSize(1000, 600, true);
                break;
            case 'leeks-right-close':
                mainWindow.setSize(370, 563, true);
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

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

// 创建calendar窗口方法
function openCalendarWindow() {
    leeksMiniWin = new BrowserWindow({
        width: 189, //悬浮窗口的宽度 比实际DIV的宽度要多2px 因为有1px的边框
        height: 24, //悬浮窗口的高度 比实际DIV的高度要多2px 因为有1px的边框
        type: 'toolbar',    //创建的窗口类型为工具栏窗口
        frame: false,   //要创建无边框窗口
        // resizable: false, //禁止窗口大小缩放
        show: false,    //先不让窗口显示
        alwaysOnTop: true,  //窗口是否总是显示在其他窗口之前
        // parent: mainWindow, // win是主窗口
        useContentSize: true,
        transparent: false,
        backgroundColor: 'transparent',
        movable: true,
        roundedCorners: false,
        maximizable: false,
        minimizable: false,
        webPreferences: {//网页功能的设置
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
            darkTheme: true
        }
    })
    // leeksMiniWin.setIgnoreMouseEvents(true)
    leeksMiniWin.loadURL(winURL + '#/StockMiniWinPage');
    leeksMiniWin.on('closed', () => {
        leeksMiniWin = undefined
        unRegistProviderWindow(TAG)
    });
    registProviderWindow(leeksMiniWin, TAG);


}
