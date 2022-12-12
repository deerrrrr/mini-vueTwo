import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom/index"

function createElm(vnode) {
  let { tag, data, children, text } = vnode
  if (typeof tag === 'string') { // 标签
    vnode.el = document.createElement(tag)
    patchProps(vnode.el, data)
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))
    });
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

function patchProps(el, props) {
  for (let key in props) {
    if (key === 'style') {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName]
      }
    } else {
      el.setAttribute(key, props[key])
    }
  }
}

function patch(oldVNode, vnode) {
  const isRealElement = oldVNode.nodeType
  if (isRealElement) {
    const elm = oldVNode
    const parentElm = elm.parentNode
    let newElm = createElm(vnode)
    parentElm.insertBefore(newElm, elm.nextSibling)
    parentElm.removeChild(elm) //删除老节点

    return newElm
  } else {
    // diff算法
  }
}


export function initLifeCycle(Vue) {
  Vue.prototype._update = function (vnode) {

    const el = this.$el;
    console.log(vnode);
    // patch 既有初始化的功能 又有更新的功能
    this.$el = patch(el, vnode);
  }
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments)
  }
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)
  }
  Vue.prototype._s = function (value) {
    if (typeof value !== 'object') return value
    return JSON.stringify(value)
  }
  Vue.prototype._render = function () {
    return this.$options.render.call(this)
  }
}



export function mountComponent(vm, el) {
  vm.$el = el
  // 1.调用render方法产生虚拟节点 虚拟DOM
  // 2.根据虚拟DOM产生真实DOM
  // 3.插入到el元素中
  const updateComponent = () => {
    vm._update(vm._render())
  }
  const watcher = new Watcher(vm, updateComponent, true) // true用于标识是一个渲染watcher
  console.log(watcher);
}

/* vue核心流程 
1创造了响应式数据
2模板转换成ast语法树
3将ast语法树转换成render函数
4后续每次数据更新只执行render 无需执行ast转化过程
*/
