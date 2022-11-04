/**
 * 简单路由
 * @summary 使用订阅模式，实现简单路由分发
 * @function add 添加订阅
 * @function remove 移除订阅`
 * @function has 判断路径是否已注册
 * @function emit 触发订阅
 */
export default class LowRouter {
    static create() {
        return new LowRouter()
    }

    constructor() {
        this.handlers = new Map([])
    }

    add(key, handler) {
        if (this.handlers.has(key)) {
            const h = this.handlers.get(key)
            h.push(handler)
        } else {
            this.handlers.set(key, [handler])
        }

        return this
    }

    remove(key) {
        this.handlers.has(key) && this.handlers.delete(key)
        return this
    }

    has(key) {
        return this.handlers.has(key)
    }

    emit(key, ...args) {
        if (!this.handlers.has(key)) {
            console.error('ERROR: 未找到路由配置', key)
            return null
        }

        this.handlers.get(key).forEach((handler) => {
            handler(...args)
        })
        return this
    }
}
