import Dep from "./dep";

// 每个属性有一个dep（属性就是被观察者）
// watcher是观察者 属性变了会通知观察者更新 ==>观察者模式

let id = 0
class Watcher {
  constructor(vm, fn, options) {
    this.id = id++;
    this.renderWatcher = options
    this.getter = fn; // getter意味着调用这个函数可以发生取值操作
    this.deps = [] // 实现计算属性和一些清理工作的时候需要
    this.depsId = new Set()
    this.get()
  }
  addDep(dep) {
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addSub(this)
    }

  }
  get() {
    Dep.target = this;
    this.getter() // 取值
    Dep.target = null; // 渲染完后就清空 利用单线程
  }
  update() {
    queueWatcher(this);
    // this.get() // 重新渲染 不立即更新了
  }
  run() {
    this.get()
  }
}
let queue = []
let has = {}
let pending = false // 防抖
function flushSchedulerQueue() {
  let flushQueue = queue.slice(0)
  queue = []
  has = {}
  // 在刷新的过程中有新的watcher 可以放进queue
  pending = false
  flushQueue.forEach(q => q.run())
}
function queueWatcher(watcher) {
  const id = watcher.id
  if (!has[id]) {
    queue.push(watcher)
    has[id] = true
    // 不管update执行多少次 最终只执行一次刷新操作
    if (!pending) {
      setTimeout(flushSchedulerQueue, 0)
      pending = true
    }
  }
}
export default Watcher