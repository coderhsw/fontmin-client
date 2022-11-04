import { app, shell, BrowserWindow } from 'electron'
import * as path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import MainSocket from '@socket/main.js'
import Router from './router/index.js'

process.on('unhandledRejection', function (reason, promise) {
    console.log('unhandledRejection reason', reason)
    console.log('unhandledRejection promise', promise)
})

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 960,
        height: 630,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon: path.join(__dirname, '../../build/icon.png') } : {}),
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    const mainSocket = new MainSocket()
    mainSocket.open()
    mainSocket.addWindow(mainWindow)

    new Router(mainSocket)

    mainWindow.webContents.on('dom-ready', () => {
        setTimeout(() => {
            mainSocket
                .mixSend('getWinId', {
                    winIds: [mainWindow.id],
                    data: mainWindow.id
                })
                .then(() => {
                    // console.log(pack.body)
                })
        }, 1000)
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
        mainWindow.setSize(1300, 800)
        mainWindow.setPosition(20, 400)
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
    const rmPath = is.dev ? path.join(process.cwd(), `src/renderer/src/assets/fonts`) : path.join(__dirname, `../renderer/assets/fonts`)
    const del = require('delete', { force: true })
    del.sync([rmPath])

    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
