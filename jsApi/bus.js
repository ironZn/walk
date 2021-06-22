// bus.js
// 因为我没写过，这里就直接盲写
class Bus {
  constructor() {
    this.busId = 0
    this.busList = []
  }
  $emit(evt, props) {
    this.busList.push({
      busId: this.busId,
      evt: evt,
      props: props
    })
    this.busId ++
  }
  $on(evt, cb) {
    const find = this.busList.find(el => el.evt === evt)
    if (find) {
      cb(find.props)
    }
  }
  $off(evt) {
    this.busList = this.busList.filter(el => el.evt !== evt)
  }
}

window.evtBus = new Bus()

