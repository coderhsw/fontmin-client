/**
 * 通信包
 * @summary
 * 定义Socket通信的数据包格式
 * @prop data 消息数据
 * @prop status 状态码
 * @prop statusText 状态提示
 * @prop backKey Promise标识
 * @prop sendKey Promise标识
 * @prop ...other 自定义属性
 *
 */
const statusMap = {
    1001: '存在同名文件或文件夹，无法覆盖'
}

export default class Pack {
    constructor(options) {
        if (!options.channel) {
            throw new Error('响应频道不能为空')
        }

        // 添加默认值
        const _opt = {
            data: null,
            status: 0,
            backKey: null,
            sendKey: this.createWaitKey(),
            ...options
        }

        const { channel, data, status, sendKey, backKey, ...other } = _opt

        this.channel = channel
        this.data = data
        this.status = status
        this.statusText = statusMap[status] || ''
        this.sendKey = sendKey
        this.backKey = backKey
        this.other = other
    }

    /**
     * 构建通信包
     */
    build() {
        return {
            body: {
                status: this.status,
                statusText: this.statusText,
                data: this.data
            },
            channel: this.channel,
            sendKey: this.sendKey,
            backKey: this.backKey,
            ...this.other
        }
    }

    // 生成唯一标识, 供mixSend类请求回调查询
    createWaitKey() {
        return new Date().getTime()
    }
}
