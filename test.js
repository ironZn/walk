// 测试文件

function a() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(1)
    },2000)
  })
}

async function bb() {
  let aa = await a()
  // 作用域
  console.log(aa)
  console.log(1111)
}

bb()
