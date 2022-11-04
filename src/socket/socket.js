/**
 * 通信对象
 * @summary 抽离公共通信模型，向外开发通用通信接口
 * @props router 回调路由
 * @props ipc 抽象通信对象
 * @props waitQueue 回调队列, 通过将对ipc包装为Promise, 实现类似http请求的调用方式
 * @function open 开启通信监听
 * @function close 关闭通信监听
 * @function createPack 创建通信包
 * @function send 普通发送, 不会向 waitQueue 添加返回处理
 * @function mixSend 返回Pomise, 类http请求的发送, 会向 waitQueue 添加返回处理
 *
 * @example
 * const socket1 = new Socket(router, ipc)
 * // 开启监听
 * socket1.open
 * // 挂载监听函数
 * socket2.on('getBack', (pack) => {
 *    // 输出信息
 *    console.log(pack.body.data)
 * })
 *
 * const socket2 = new Socket(router, ipc)
 * socket2.open()
 * socket2.on('getSend', (pack) => {
 *   // 接收信息
 *  console.log(pack.status, pack.body.data)
 *  // 消息回复
 *  socket2.send({data: 'back message'}, pack)
 * })
 *
 * // 初始发送
 * socket1.mixSend({ data: 'start message' }).then(pack => {
 *  // 类似 http 的消息回调接收
 *  console.log('promise back', pack.body.data)
 * })
 *
 */
import Pack from './pack'

export default class Socket {
    /**
     *
     * @param router 路由对象, 需要实现 { emit: 触发回调, add: 添加回调 } 接口
     * @param ipc 抽象通信对象,
     */
    constructor(router, ipc) {
        this.router = router
        this.ipc = ipc
        this.waitQueue = new Map([])
    }

    open() {
        this.ipc.onMessage((pack) => {
            // 取出目标地址
            const { channel } = pack
            const _waitKey = pack.backKey

            // 查询是否存在发送回调
            if (_waitKey && this.waitQueue.has(_waitKey)) {
                const _wait = this.waitQueue.get(_waitKey)
                this.waitQueue.delete(_waitKey)
                // TODO 这里只做了浅拷贝,
                // promise 回调与路由回调都将获取到pack,
                // 存在深拷贝问题
                _wait.resolve({ ...pack })
            }

            // 触发路由分发
            if (this.router.has(channel)) {
                this.router.emit(channel, { ...pack })
            }
        })
    }

    close() {
        this.ipc.close()
    }

    /**
     * oldPack 便于提取返回标识信息, 以供 mixSend 类型的发送，获取返回回调
     */
    createPack(options, oldPack = { channel: null, sendKey: null }) {
        const _opt = {
            channel: oldPack.channel,
            // 发送方的发送key【sendKey】, 就是返送后回调的取值key【backKey】
            backKey: oldPack.sendKey,
            ...options
        }
        return new Pack(_opt)
    }

    // 普通发送
    send(options, oldPack) {
        const _pack = new Pack(this.createPack(options, oldPack))
        this.ipc.send(_pack.build())
    }

    // 混合发送, 返回Promise
    mixSend(options, oldPack) {
        const _wait = {}
        const _pack = this.createPack(options, oldPack)

        // 将发送包装为 promise
        _wait.promiseSend = new Promise((resolve, reject) => {
            _wait.resolve = resolve
            _wait.reject = reject
            this.ipc.send(_pack.build())
        })

        // 追加到等待队列
        this.waitQueue.set(_pack.sendKey, _wait)
        return _wait.promiseSend
    }

    on(path, callback) {
        this.router.add(path, (ctx) => callback && callback(ctx))
    }
}
