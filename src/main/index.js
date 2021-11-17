import { app, BrowserWindow} from 'electron'
import '../renderer/store'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 384,
    webPreferences:{//网页功能的设置
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation:false
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const ipcMain = require('electron').ipcMain;
  // ipcMain.on('asynchronous-message', function(event, arg) {
  //   console.log(arg);  // prints "ping"
  //   event.sender.send('asynchronous-reply', 'pong');
  // });

  ipcMain.on('synchronous-message', function(event, arg) {
    if (arg == 'leeks-right') {
      mainWindow.setSize(1000, 600, true);
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

// 修改的文件：main>index.js中


// 步骤一：按官方文档添加webSecurity项


// 步骤二：在文件中添加以下配置项
//解决10.X版本跨域不成功问题(上线删除)
// app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
