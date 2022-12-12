import { compileToFunction } from "./compiler/index";
import { mountComponent } from "./lifecycle";
import { initState } from "./state";

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options // 将用户的选项挂载到实例上
    initState(vm) // 初始化状态

    if (options.el) {
      vm.$mount(options.el) // 实现数据的挂载
    }
  }
  Vue.prototype.$mount = function (el) {
    const vm = this
    el = document.querySelector(el)
    let ops = vm.$options
    if (!ops.render) {
      let template;
      if (!ops.template && el) {
        template = el.outerHTML
      } else {
        if (el) {
          template = ops.template
        }
      }
      if (template && el) {
        // 对模板进行编译
        const render = compileToFunction(template)
        ops.render = render
      }
    }
    console.log(ops.render);
    mountComponent(vm, el); // 组件的挂载
  }
}

