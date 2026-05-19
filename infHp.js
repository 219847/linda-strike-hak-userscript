vm.runtime._step = new Proxy(vm.runtime._step, {
  apply(target, thisArg, args) {
    const result = Reflect.apply(target, thisArg, args);

    for (const t of vm.runtime.targets) {
      for (const id in t.variables) {
        if (t.variables[id].name === "Health💗") {
          t.variables[id].value = 314812899129914912412;
        }
      }
    }

    return result;
  }
});
