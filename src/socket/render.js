/**
 * 渲染端Socket封装
 * @summary
 * 封装渲染端的特型的Socket对象,
 * 1.将 ipcRender 接口兼容到Socket中.
 * 2.添加特定标识【winId】的添加与解析
 *
 * @param winid 窗口id, 主进程需要该id判断需要调用的回复窗口
 * @param router 回调路由
 * @param listenKey 渲染端主通信口,监听标识. 也是主进程端的发送标识
 * @param sendKey 主进程端主通信接口, 监听标识. 也是渲染端的发送标识
 */
import { ipcRenderer } from 'electron'
import Socket from './socket'
import LowRouter from './lowRouter'

export default class RenderSocket {
    constructor(winId, router, listenKey = 'mainToRender', sendKey = 'renderToMain') {
        this.winId = winId

        // 接口兼容, 包装渲染进程 ipc
        this.ipc = {
            send: (message) => ipcRenderer.send(sendKey, message),
            onMessage: (callback) => ipcRenderer.on(listenKey, (event, data) => callback({ event, ...data })),
            close: () => ipcRenderer.removeAllListeners(listenKey)
        }

        this.socket = new Socket(router || LowRouter.create(), this.ipc)
    }

    send(path, message, oldPack) {
        this.socket.send({ channel: path, ...message, winId: this.winId }, oldPack)
        return this
    }

    mixSend(path, message) {
        return this.socket.mixSend({ channel: path, ...message, winId: this.winId })
    }

    on(path, callback) {
        this.socket.on(path, callback)
        return this
    }

    open() {
        this.socket.open()
        return this
    }

    close() {
        this.socket.close()
        return this
    }
}
