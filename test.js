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

const arr0 = [1, 2,3,4,5,1,2,4]
const aas = [...new Set(arr0)]

console.log(aas)


const arr = [{name: 1},{name: 2},{name: 3},{name: 1},{name: 2},{name: 1}]

const na = arr.reduce((pre, cur) => {
  const find = pre.find(el => el.name === cur.name)
  if (!find) {
    pre.push(cur)
  }
  return pre
}, [])

console.log(na)