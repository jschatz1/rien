let Vue;
let viewModels;
let namespaced = false;
let vmState = {};
let vm;
let baseURL = "";

function generateComputed(obj) {
  if (!obj) {
    return;
  }
  const keys = Object.keys(obj);
  let computed = {};
  keys.forEach(function (key) {
    const f = function () {
      return obj[key];
    };
    Object.defineProperty(f, "name", { value: key, writable: false });
    computed[key] = f;
  });
  return computed;
}

function namespacedState(name) {
  if (namespaced) {
    return generateComputed(viewModels[name].state);
  } else {
    return generateComputed(viewModels[name].state[name]);
  }
}

function getMediators(name) {
  return generateMethods(viewModels[name].mediator, name);
}

function generateMethods(obj, name) {
  if (!obj) {
    return;
  }
  let proxiedMethods = {};
  const methodKeys = Object.keys(obj);
  methodKeys.forEach(function (methodKey) {
    const f = function (...args) {
      obj[methodKey].apply(null, [{ state: vmState[name] }, ...args]);
    };
    Object.defineProperty(f, "name", { value: methodKey, writable: false });
    proxiedMethods[methodKey] = f;
  });
  let methods = proxiedMethods;
  return methods;
}

function buildState() {
  vmState = {};
  const keys = Object.keys(viewModels);
  keys.forEach(function (key) {
    vmState[key] = viewModels[key].state;
  });
}

function createVM(name) {
  vm = new Vue({
    data: {
      __vmState: vmState,
    },
  });
}

function createServices() {
  const viewModelKeys = Object.keys(viewModels);
  viewModelKeys.forEach(function (viewModelKey) {
    const serviceKeys = Object.keys(viewModels[viewModelKey].service);
    if (!serviceKeys.length) return;
    serviceKeys.forEach(function (serviceKey) {
      const service = viewModels[viewModelKey].service[serviceKey];
      const serviceBaseRoute = `${baseURL}/${viewModelKey}`;
      service.index = function () {
        return fetch(serviceBaseRoute).then((res) => res.json());
      };
      service.create = function (data) {
        return fetch(serviceBaseRoute, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(data),
        }).then((res) => res.json());
      };
      service.show = function (id) {
        return fetch(`${serviceBaseRoute}/${id}`).then((res) => res.json());
      };
      service.update = function (id, data) {
        return fetch(`${serviceBaseRoute}/${id}`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "PUT",
          body: JSON.stringify(data),
        }).then((res) => res.json());
      };
      service.delete = function (id) {
        return fetch(`${serviceBaseRoute}/${id}`, {
          method: "DELETE",
        }).then((res) => res.json());
      };
    });
  });
}

function reinInit() {
  const options = this.$options;
  // dependency injection
  if (options.rien) {
    if (options.rien.namespaced) {
      namespaced = options.rien.namespaced;
    }
    if (!options.rien.viewModels) {
      throw Error("[Rien warn] Missing `viewModel` property of rien object");
    }
    viewModels = options.rien.viewModels;
    buildState();
    createVM();
    if (options.rien.baseURL) {
      baseURL = options.rien.baseURL;
      createServices();
    }
  } else if (options.parent && viewModels[options.name]) {
    this.$options.computed = {
      ...(options.computed ? options.computed : {}),
      ...namespacedState(options.name),
    };
    this.$options.methods = {
      ...(options.methods ? options.methods : {}),
      ...getMediators(options.name),
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

export default {
  install,
};
