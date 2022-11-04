const apis = import.meta.globEager('./apis/*.js')

export default class Router {
    constructor(socket) {
        Object.values(apis).forEach((value) => {
            new value.default(socket)
        })
    }
}
