// call，apply，bind的简单实现

// fn.call(obj)
// 1.fn这个函数要执行
// 2.fn的this执行obj
// 如果把fn放在obj里执行，就达到了替换this的效果

// 实现call
Function.prototype.call2 = function(ctx) {
  ctx.fn = this // this：调用call的函数
  // 截取参数
  let args = [...arguments].slice(1)
  // 调用
  ctx.fn(...args)
  // 用完就删除
  delete ctx.fn
}

// 实现apply
// apply和call差不多，做个小小的改造
Function.prototype.apply2 = function(ctx) {
  ctx.fn = this // this：调用call的函数
  // 截取参数
  let args = [...arguments].slice(1)
  // 调用,这里改一下就好了
  ctx.fn(...args[0])
  // 用完就删除
  delete ctx.fn
}

// 实现bind
// 1.特性是返回一个函数
// 2.返回的函数还可以接着传参
// 比call多了两步操作
// 这里不考虑调用bind的函数作为构造函数，有时间再加上。--todo
Function.prototype.bind2 = function(ctx) {
  // 获取调用的函数fn,this执行fn,请看下方调用示例
  let that = this
  // 截取外层参数
  let argsOut = [...arguments].slice(1)
  // 返回一个函数
  return function () {
    // 截取内层参数
    let argsIn = [...arguments]
    // 执行调用的函数fn
    that.apply2(ctx, [...argsOut, ...argsIn])
  }
}



let obj = { name: 'xiaowen' }

let fn = function(a, b) {
  console.log(a)
  console.log(b)
  console.log(this.name)  
}

fn.call2(obj, 1, 2)

fn.apply2(obj, [3, 4])

fn.bind2(obj, 5 ,6)()

let b2 = fn.bind2(obj, 7)
b2(8)