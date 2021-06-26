// bus.js
// 因为我没写过，这里就直接盲写
// 实现过于简单，没考虑事件重复
class Bus {
  constructor() {
    this.busId = 0
    this.busList = []
  }
  on(evt, cb) {
    this.busList.push({
      busId: this.busId,
      evt,
      cb
    })
    this.busId ++
  }
  emit(evt, props) {
    // 这里可能有很多参数
    // const args = [...arguments].slice(1)
    const find = this.busList.find(el => el.evt === evt)
    if (find) {
      // find.cb.apply(null, args)
      find.cb(props)
    }
  }
  off(evt) {
    this.busList = this.busList.filter(el => el.evt !== evt)
  }
}

window.evtBus = new Bus()

