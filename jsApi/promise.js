// 极简单版promise，没时间写复杂的
/////////
// https://segmentfault.com/a/1190000016550260

// const aa = new Promise((resolve,reject) => {
//   if (xw) {
//     resolve(1)
//   } else {
//     reject(0)
//   }
// })

// aa.then(res => {
//   console.log(res)
// }, rej => {
//   console.log(rej)
// })

class myPromise {
  // 由promise进行反推，回调函数对应一次调用。调用则对应一次回调
  constructor(fn) {
    this.status = 'pendding'
    this.succVal = undefined
    this.failVal = undefined

    this.succList = []
    this.failList = []
    // 先定义两个工具
    const succFn = (val) => {
      if (this.status === 'pendding') {
        this.status = 'resolve'
        this.succVal = val
        console.log('--2')
        // 1联动2
        // succList的结构 [ Function, Function, ... ]
        // 异步--1先执行，添加Function
        // 然后躺平
        this.succList.forEach(resCb => {
          resCb()
        })
      }
    }

    const failFn = (err) => {
      if (this.status === 'pendding') {
        this.status = 'reject'
        this.failVal = err
        this.failList.forEach(rejCb => {
          rejCb()
        })
      }
    }
    // fn(() => {}, () => {})
    fn(succFn,failFn)
  }
  then(resolve, reject) {
    // 如果是异步，会走到这里，当调用.then的时候添加回调
    // 2联动1, --1
    if (this.status === 'pendding') {
      console.log('--1')
      this.succList.push(() => {
        resolve(this.succVal)
      })
      this.failList.push(() => {
        reject(this.failVal)
      })
    }
    // 回调新值
    if (this.status === 'resolve') {
      resolve(this.succVal)
    } else if (this.status === 'reject') {
      reject(this.failVal)
    }
  }
  catch(reject) {
    reject(this.failVal)
  }
}

// 这种编程思想很nice
// // --2
// this.succList.forEach(resCb => {
//   resCb()
// })
// // --1
// this.succList.push(() => {
//   resolve(this.succVal)
// })

const mp = new myPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(100)
  }, 1000)
  // resolve(1000)
})
// 如果包裹异步，先执行.then 很好理解
mp.then(res => {
  console.log(res)
})