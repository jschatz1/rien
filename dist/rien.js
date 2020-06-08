/*!
 * rein v0.0.1
 * (c) 2020 Jacob Schatz
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

let Vue;

function reinInit() {
  const options = this.$options;
  console.log("this", this.name);
  // resources injection
  if (options.resources) {
    this.$resources =
      typeof options.resources === "function"
        ? options.resources()
        : options.resources;
  } else if (options.parent && options.parent.$resources) {
    this.$resources = options.parent.$resources;
  }
}

function applyMixin(Vue) {
  Vue.mixin({ beforeCreate: reinInit });
}

function install(_Vue) {
  if (Vue && _Vue === Vue) {
    if (__DEV__) {
      console.error(
        "[rien] already installed. Vue.use(Rein) should be called only once."
      );
    }
    return;
  }
  Vue = _Vue;
  applyMixin(Vue);
}

var index = {
  install,
};

exports.default = index;
exports.install = install;
