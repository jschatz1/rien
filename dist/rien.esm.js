/*!
 * rein v0.0.1
 * (c) 2020 Jacob Schatz
 * @license MIT
 */
let Vue;
let viewModels;
let namespaced = false;
let vmState = {};
let vm;

function generateComputed(obj) {
  if(!obj) {
    return;
  }
  const keys = Object.keys(obj);
  console.log(obj);
  let computed = {};
  keys.forEach(function(key) {
    const f = function () {
    return obj[key];
  };
  Object.defineProperty(f, 'name', {value: key, writable: false});
    computed[key] = f;
  });
  return computed;
}

function namespacedState(name) {
  if(namespaced) {
    return generateComputed(viewModels[name].state);
  } else {
    return generateComputed(viewModels[name].state[name]);
  }
}

function getMediators(name) {
  return generateMethods(viewModels[name].mediator);
}

function generateMethods(obj) {
  if(!obj) {
    return;
  }
  let methods = obj;
  return methods;
}

function buildState() {
  vmState = {};
  const keys = Object.keys(viewModels);
  keys.forEach(function(key) {
    vmState[key] = viewModels[key].state;
  });
}

function createVM(name) {
  vm = new Vue({
    data: {
      __vmState: vmState
    }
  });
}

function reinInit() {
  const options = this.$options;
  // dependency injection
  if (options.rien) {
    if(options.rien.namespaced) {
      namespaced = options.rien.namespaced;
    }
    if(!options.rien.viewModels) {
      throw Error("[Rien warn] Missing `viewModel` property of rien object");
    }
    viewModels = options.rien.viewModels;
    buildState();
    createVM();
  } else if (options.parent && viewModels[options.name]) {
    this.$options.computed = {
      ...options.computed ? options.computed : {},
      ...namespacedState(options.name),
    };
    this.$options.methods = {
      ...options.methods ? options.methods : {},
      ...getMediators(options.name)
    };
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
  install
};

export default index;
export { install };
