function freezeVariable(varName, forcedValue) {
    for (const t of vm.runtime.targets) {
        for (const id in t.variables) {
            const v = t.variables[id];
            if (v.name === varName) {
                Object.defineProperty(v, "value", {
                    get() { return forcedValue; },
                    set(_) { /* ignore all writes */ },
                    configurable: true
                });
            }
        }
    }
}

freezeVariable("Dash cooldown 💨", 0);
