// xw.js ---- 工欲善其事必先利其器
// 2021-6-1 至 2021-6-2
/*
  mvvm源码解析（低配版）
  参考链接： https://github.com/DMQ/mvvm

  有些东西，一看就会一做就废

*/
//两大核心：observer（基础核心），watcher（赋能核心）

// mvvm的Observer
/**
 * 
function Observer(data) {
  if (!data || typeof data !== 'object') {
    return
  }
  Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
}
function defineReactive(data, key, val) {
  // 深度检查
  Observer(val)
  // 自定义属性
  Object.defineProperty(data, key, {
    configurable: false,
    enumerable: true,
    get() {
      return val
    },
    set(newVal) {
      if (val === newVal) {
        return
      }
      val = newVal
    }
  })
}
 * 
 */

var gid = 1

function observer(data) {
  if (!data || typeof data !== 'object') {
    return
  }
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key])
  })
}

function defineReactive(data, key, val) {
  // 初始化订阅器
  var dep = new Dep()
  // 深度检查
  observer(val)
  // 自定义属性
  // 双向绑定原理
  // 通过object.defineProperty给实现添加setter，getter进行属性监听
  // 当属性发生变动，通知视图更新
  // 视图怎么更新？
  // 更新入口是dep.notify,在watcher里临时把this指向dep，从而在dep中操作watcher，实现update
  // update回调新值给v-bind中的watcher，然后视图就更新了。
  Object.defineProperty(data, key, {
    configurable: false,
    enumerable: true,
    get() {
      // 请注意，这里的操作有点意思 *1*
      // Dep.target是什么？ 是watcher
      // dep.addSub在做什么？ 添加订阅者，以便触发更新
      // 这里有问题，如下这样写会无限添加
      // Dep.target && dep.addSub(Dep.target)
      // 我这里和它的源码不太一样
      // 首先搞清楚，每个属性只能有一个watcher，所以在new watcher的时候给watcher实例添加一个id
      // 根据id的唯一性，确保这里不会重复添加
      if (Dep.target) {
        if (!dep.subs.some(el => el.gid == gid)) {
          dep.addSub(Dep.target)
        }
      }
      
      return val
    },
    set(newVal) {
      if (val === newVal) {
        return
      }
      val = newVal
      // 新值继续observer
      observer(newVal)
      // 属性变化通知更新
      dep.notify()
    }
  })
}

// 订阅器作为watcher与数据的桥梁
// 管理watcher，根据数据变动对watcher执行update

// 订阅器
function Dep() {
  this.subs = []
}

Dep.prototype = {
  // 添加订阅者
  addSub(sub) {
    this.subs.push(sub)
  },
  // 通知变化
  notify() { 
    // 这里把所有的watcher都执行一次update
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}

Dep.target = null

function Watcher(vm, exp, cb) {
  this.vm = vm
  this.exp = exp
  this.cb = cb
  this.gid = gid
  // 拿到更新后的value
  this.value = this.get()
}

Watcher.prototype = {
  get() {
    // 暂存watcher至Dep，将当前订阅器指向自己 *1:* 
    this.gid = gid
    Dep.target = this
    // 触发getter更新，使addSub顺理成章
    var value = this.vm[this.exp]
    // debugger
    // add完要重置，否则直接调用属性也会一直添加
    Dep.target = null
    return value
  },
  // sub有update()方法
  update() {
    Dep.target = null
    // 取最新值
    var value = this.get()
    // 取老值
    var oldValue = this.value
    // 关键点来了
    if (value !== oldValue) {
      // 有对比才有更新
      this.value = value
      // 这里将回调给watcher，请往下看
      this.cb.call(this.vm, value, oldValue)
    }
  }
}

// 逻辑
// 1.获取dom，根据原有dom创建文档片段fragement
// 2.深度遍历fragement让每个节点都去执行compile
// 3.编译节点开始
    // 文本取{{}}，执行v-text指令
    // dom节点编译，获取节点属性，区分原生事件和vue指令
// 4.vue指令解析，所有指令执行bind方法，
    // 不同的指令调用不同的函数，初始化界面
    // 添加watcher，当页面的属性发生变化时，执行uedate获取更新后数据的回调

// 模板编译
function Compile(el, vm) {
  this.$el = this.isElementNode(el) ? el : document.querySelector(el)
  this.$vm = vm

  if (this.$el) {
    // 把真实dom拷贝出来，这里没有虚拟dom那么高端
    this.$fragment = this.node2Fragement(this.$el)
    // 准备起飞
    this.init()
    // 替换到真实dom
    // appendChild的两种用法： 1. 替换原有节点 2. 追加新节点
    // 这里是替换
    this.$el.appendChild(this.$fragment)
  }
}

Compile.prototype = {
  node2Fragement(el) {
    // 创建文档片段
    var fragment = document.createDocumentFragment(), child;
    // 不断复制，直达child为undefined
    while (child = el.firstChild) {
      // 这里是追加
      fragment.appendChild(child)
    }

    return fragment
  },

  init() {
    this.compileElement(this.$fragment)
  },

  compileElement(el) {
    var childNodes = el.childNodes, me = this;
    // 我这里用了箭头函数其实不用担心this指向问题
    // [].slice.call(childNodes) 类数组转数组，也可用Array.form等
    [].slice.call(childNodes).forEach(node => {
      var text = node.textContent
      var reg = /\{\{(.*)\}\}/

      if (me.isElementNode(node)) {
        me.compile(node)
      } else if (me.isTextNode(node) && reg.test(text)) {
        // debugger
        // 是带有{{}}的文本
        // console.log(RegExp.$1.trim())
        // RegExp.$1.trim() 获取正则的子匹配
        me.compileText(node, RegExp.$1.trim())
      }
      
      // 下钻
      if (node.childNodes && node.childNodes.length) {
        me.compileElement(node)
      }

    })
  },

  compile(node) {
    // 获取所有属性
    var nodeAttributes = node.attributes, me = this;

    [].slice.call(nodeAttributes).forEach(attr => {
      var attrName = attr.name

      // 解析属性
      if (me.isDirective(attrName)) {
        //例如：v-model="obj.prop"  exp = obj.prop, dir = mode
        var exp = attr.value
        var dir = attrName.slice(2)

        if (me.isEventDirective(dir)) {
          // v-on 原生事件
          compileUtils.eventHandler(node, me.$vm, exp, dir)
        } else {
          // vue指令
          compileUtils[dir] && compileUtils[dir](node, me.$vm, exp)
        }
        // 用完就删掉，更加美观
        node.removeAttribute(attrName)
      }
    })

  },

  compileText(node, exp) {
    compileUtils.text(node, this.$vm, exp)
  },

  isDirective(attr) {
    return attr.indexOf('v-') > -1
  },

  isEventDirective(attr) {
    return attr.indexOf('on') > -1
  },

  isElementNode(node) {
    return node.nodeType == 1
  },

  isTextNode(node) {
    return node.nodeType == 3
  }
}

var compileUtils = {
  // 原生事件
  eventHandler(node, vm, exp, dir) {
    //dir = on:click
    var eventType = dir.split(':')[1], fn = vm.$options.methods && vm.$options.methods[exp];
    // eventType = click, fn 需要把事件放在methods
    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },
  // v-bind:prop="obj"
  // dir = bind, exp = obj
  // bind最核心，所有指令都将通过bind添加watcher
  bind(node, vm, exp, dir) {
    // 调用更新函数
    // debugger
    var updateFn = updater[dir + 'Updater']
    // 获取vm上的值，初始化界面
    updateFn && updateFn(node, this._getVMVal(vm, exp))
    // mvvm赋能核心
    // 每条属性都拥有一个watcher，维护管理自己的数据，当数据发生变化时，回调更新。
    // 何时回调？注意sub.update()的执行时机，在属性set方法中发生
    gid ++;
    new Watcher(vm, exp, (value, oldValue) => {
      // 这里拿到新值执行更新
      updateFn && updateFn(node, value, oldValue)
    })

  },
  // v-model
  // 双向绑定原理解析
  model(node, vm, exp) {
    this.bind(node, vm, exp, 'model')
    // 此时已经初始化，且被添加了watcher
    var me = this, val = this._getVMVal(vm, exp)

    // 此处val为什么取this._getVMVal(vm, exp)，node.value不是已经给初始化了吗
    // 注意，input是双向操作的标签，和普通静态标签不同，node.value会根据用户操作发生变化
    // 所以用this._getVMVal(vm, exp)，它是真正的oldValue

    // 实现数据的双向绑定
    node.addEventListener('input', e => {
      // debugger
      var newValue = e.target.value
      // 新旧对比
      if (val === newValue) {
        return
      }
      // 更新数据，渲染视图
      me._setVMVal(vm, exp, newValue)
      // val = newValue
    })
  },

  text(node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },

  html(node, vm, exp) {
    this.bind(node, vm, exp, 'html')
  },

  class(node, vm, exp) {
    this.bind(node, vm, exp, 'class')
  },

  _getVMVal(vm, exp) {
    // exp = obj.a.b.c
    // 取到表达式的值
    var val = vm
    exp = exp.split('.')
    exp = exp.forEach(el => {
      val = val[el]
    })
    return val
    // es6一样用
    // var nexp = exp.split('.')
    // var val = nexp.reduce((pre, cur) => {
    //   return pre[cur]
    // },vm)
    // return val
    
  },

  _setVMVal(vm, exp, value) {
    var val = vm
    exp = exp.split('.')
    exp.forEach((k, i) => {
      // 这里是为了给 vm.a.b.c 的c 赋值
      if (i < exp.length -1) {
        val = val[k]
      } else {
        val[k] = value
        // 这里会走到definedproperty的set，继续触发watcher的update回调新值，
        // 执行updateFn，渲染视图
      }
    })
    // es6一样用
    // var nexp = exp.split('.')
    // nexp.reduce((pre, cur, idx) => {
    //   if (nexp.length - 1 == idx) {
    //     pre[cur] = value
    //   }
    //   return pre[cur]
    // },vm)
  }
}

var updater = {
  textUpdater(node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value
  },

  htmlUpdater(node, value) {
    node.innerHTML = typeof value === 'undefined' ? '' : value
  },

  classUpdater(node, value, oldValue) {
    var className = node.className

    className = className.replace(oldValue, '').replace(/\s$/, '')
    
    var space = className && String(value) ? ' ' : ''

    node.className = className + space + value
  },

  modelUpdater(node, value) {
    node.value = typeof value === 'undefined' ? '' : value
  }
}

function MVVM(options) {
  this.$options = options || {}

  var data = this.data = this.$options.data

  // 属性代理
  Object.keys(data).forEach(el => {
    // this[el] = this.data[el]
    // 为什么不能像上面这样做？因为不具备引用关系
    this.proxyData(el)
  })

  // 劫持所有数据给他绑上自定义的set，get
  observer(data, this)

  // 编译页面
  new Compile(options.el || document.body, this)
}

MVVM.prototype = {
  // 这里在项目中还是常用的
  // 手动建立数据之间的引用关系
  proxyData(key) {
    var me = this
    Object.defineProperty(this, key, {
      configurable: false,
      enumerable: true,
      get() {
        return me.data[key]
      },
      set(newVal) {
        me.data[key] = newVal
      }
    })
  }
}
