/**
 * 主进程Socket封装
 * @summary
 * 与RendSocket类似, 将主进程通信 ipcMain 兼容到Socket中
 * 主要区别在于发送接口存在不同，应为页面进程与主进程存一对多的关系,
 * 主进程需要通过具体的 window.webContext 发送数据到指定的窗口。
 * 所以从主进程端发送数据存在， 一对一， 一对多, 全广播 的模式。
 * 这里通过缓存window对象，并在通信是传递winId实现对发送窗口的识别。
 *
 * @param router 回调路由
 * @param listenKey  主进程端主通信口,监听标识. 也是渲染端的发送标识
 * @param sendKey 渲染端主通信接口,监听标识. 也是主进程端的发送标识
 */

const { ipcMain } = require('electron')
import Socket from './socket'
import LowRouter from './lowRouter'

export default class MainSocket {
    constructor(router, listenKey = 'renderToMain', sendKey = 'mainToRender') {
        this.winds = new Map([])
        this.ipc = {
            onMessage: (callback) => ipcMain.on(listenKey, (event, data) => callback({ event, ...data })),
            send: (pack) => {
                const { winIds, ..._pack } = pack

                // 筛选目标窗口
                let winds = []
                if (winIds) {
                    winds = winIds.reduce((acc, next) => {
                        if (this.winds.has(next)) {
                            return [...acc, this.winds.get(next)]
                        }
                        return acc
                    }, [])
                } else {
                    winds = [...this.winds.values()]
                }

                // 向各窗口分发消息
                winds.forEach((win) => {
                    win.webContents.send(sendKey, _pack)
                })
            },

            close: () => ipcMain.removeAllListeners(listenKey)
        }

        this.socket = new Socket(router || LowRouter.create(), this.ipc)
    }

    // 缓存窗口对象
    addWindow(window) {
        this.winds.set(window.id, window)
        return this
    }

    removeWind(wind) {
        this.winds.has(wind.id) && this.winds.delete(wind.id)
        return this
    }

    send(path, message, oldPack) {
        this.socket.send({ channel: path, ...message }, oldPack)
        return this
    }

    mixSend(path, message) {
        return this.socket.mixSend({ channel: path, ...message })
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
