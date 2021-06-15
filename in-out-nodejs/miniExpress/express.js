const http = require('http')
const url = require('url')
let router = []
class expressApp {
  get(path, handler) {
    router.push({
      path,
      method: 'get',
      handler
    })
  }
  listen() {
    http.createServer((req, res) => {
      let { pathname } = url.parse(req.url, true)
      for (const route of router) {
        // 匹配路由，设置回调
        if (route.path === pathname) {
          route.handler && route.handler(req, res)
          return
        }
      }
    }).listen(...arguments) //参数代换
  }
} 

module.exports = function(config) {
  return new expressApp()
}