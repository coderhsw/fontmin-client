import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import RenderSocket from '@socket/render.js'

const renderSocket = new RenderSocket()
renderSocket.open()
renderSocket.on('getWinId', (pack) => {
    renderSocket.winId = pack.body.data
    renderSocket.send('getWinIdBack', { data: 'getWinId success' }, pack)
})

// Custom APIs for renderer
const api = {
    mixSend: async (...args) => {
        return await renderSocket.mixSend(...args)
    }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    window.electron = electronAPI
    window.api = api
}
