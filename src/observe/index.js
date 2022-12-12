import { newArrayProto } from "./array"
import Dep from "./dep"

class Observer {
  constructor(data) {

    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false // 将__ob__变成不可枚举的
    })
    // data.__ob__ = this; // 这样写会死循环
    if (Array.isArray(data)) {

      // 数组比较特殊
      data.__proto__ = newArrayProto
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }
  walk(data) { // 循环对象 对属性依次劫持

    // 重新定义属性 // 这也是vue2性能不好的一个原因
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
  }
  observeArray(data) {
    data.forEach(item => observe(item))
  }
}

export function defineReactive(target, key, value) {
  observe(value) //如果value是对象，还要进行劫持
  let dep = new Dep(); // 每一个属性都有一个dep
  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) {
        dep.depend(); // 让这个属性的收集器记住当前的watcher
      }
      return value
    },
    set(newValue) {
      if (newValue === value) return
      observe(newValue)
      console.log("用户设置了");
      value = newValue
      dep.notify(); //通知更新
    }
  })

}

export function observe(data) {

  // 只对对象进行劫持
  if (typeof data !== 'object' || data == null) {
    return
  }
  if (data.__ob__ instanceof Observer) { // 说明这个对象被代理过
    return __ob__
  }

  // 如果一个对象被劫持过，就无需再劫持
  return new Observer(data)
}