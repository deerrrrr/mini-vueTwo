let id = 0
class Dep {
  constructor() {
    this.id = id++ // 属性的dep要收集watcher
    this.subs = [] // 当前属性对应的watcher有哪些
  }
  depend() {
    Dep.target.addDep(this) // 让watcher记住dep
    // this.subs.push(Dep.target) // 会重复
  }
  addSub(watcher) {
    this.subs.push(watcher)
  }
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}
Dep.target = null;

export default Dep