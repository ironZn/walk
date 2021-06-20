// 模拟实现new
// new Fn,其中的new作为一个关键字我们没法直接实现
// 回想一下new的用法
  // function Otaku (name, age) {
  //   this.name = name;
  //   this.age = age;

  //   this.habit = 'Games';
  // }

  // Otaku.prototype.strength = 60;

  // Otaku.prototype.sayYourName = function () {
  //   console.log('I am ' + this.name);
  // }

  // var person = new Otaku('Kevin', '18');

  // console.log(person.name) // Kevin
  // console.log(person.habit) // Games
  // console.log(person.strength) // 60

  // person.sayYourName(); // I am Kevin

// 实现逻辑：
// 1.定义一个空对象obj
// 2.obj具有构造函数原型的属性
// 3.函数的this替换成obj，bj具有构造函数的属性
// 大功告成

function myNew() {
  let obj = {}
  // 取arguments[0]
  let constract = [].shift.call(arguments)
  // 把函数的原型添加到obj的原型链上
  // obj具有构造函数原型的属性
  obj.__proto__ = constract.prototype
  // 函数的this指向obj，实例也就可以访问obj的原型链了
  constract.apply(obj, arguments)
  return obj
}

function Man(name, age) {
  this.name = name
  this.age = age
  this.can = 'fly'
}
Man.prototype.say = function() {
  console.log('我是%s，今年%d。我会%s，擅长%s', this.name, this.age, this.can, this.walk)
}
Man.prototype.walk = '跑路'

let per = myNew(Man, 'lixin', 18)

per.say()


