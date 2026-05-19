// ==UserScript==
// @name         TurboWarp Variable Freezer UI
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Adds buttons to freeze cooldown/health variables in TurboWarp
// @match        https://turbowarp.org/*
// @match        https://turbowarp.org/*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Wait for VM to exist
    function waitForVM(callback) {
        const check = setInterval(() => {
            if (window.vm && window.vm.runtime) {
                clearInterval(check);
                callback();
            }
        }, 100);
    }

    // Freeze variable using defineProperty
    function freezeVariable(varName, forcedValue) {
        for (const t of vm.runtime.targets) {
            for (const id in t.variables) {
                const v = t.variables[id];
                if (v.name === varName) {
                    Object.defineProperty(v, "value", {
                        get() { return forcedValue; },
                        set(_) {},
                        configurable: true
                    });
                }
            }
        }
    }

    // Safe unfreeze
    function unfreezeVariable(varName) {
        for (const t of vm.runtime.targets) {
            for (const id in t.variables) {
                const v = t.variables[id];
                if (v.name === varName) {
                    const desc = Object.getOwnPropertyDescriptor(v, "value");
                    if (desc && desc.configurable) {
                        const current = v.value;
                        delete v.value;
                        v.value = current;
                    }
                }
            }
        }
    }

    // UI button maker
    function makeButton(label, onClick) {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.style.position = "fixed";
        btn.style.top = `${60 + document.querySelectorAll(".tw-freeze-btn").length * 40}px`;
        btn.style.left = "10px";
        btn.style.zIndex = 999999;
        btn.style.padding = "8px 12px";
        btn.style.background = "#222";
        btn.style.color = "white";
        btn.style.border = "2px solid #555";
        btn.style.borderRadius = "6px";
        btn.style.cursor = "pointer";
        btn.classList.add("tw-freeze-btn");
        btn.onclick = onClick;
        document.body.appendChild(btn);
        return btn;
    }

    waitForVM(() => {
        console.log("TurboWarp Variable Freezer Loaded");

        // Toggle states
        let fireActive = false;
        let dashActive = false;
        let healthActive = false;

        // Health proxy state
        let healthProxyEnabled = false;
        let originalStep = null;

        // FIRE BUTTON
        const fireBtn = makeButton("Unlimited Fire", () => {
            fireActive = !fireActive;
            if (fireActive) {
                freezeVariable("Fire cooldown 🕒", 0);
                fireBtn.textContent = "Unlimited Fire (active)";
            } else {
                unfreezeVariable("Fire cooldown 🕒");
                fireBtn.textContent = "Unlimited Fire";
            }
        });

        // DASH BUTTON
        const dashBtn = makeButton("Unlimited Dash", () => {
            dashActive = !dashActive;
            if (dashActive) {
                freezeVariable("Dash cooldown 💨", 0);
                dashBtn.textContent = "Unlimited Dash (active)";
            } else {
                unfreezeVariable("Dash cooldown 💨");
                dashBtn.textContent = "Unlimited Dash";
            }
        });

        // HEALTH BUTTON (via _step proxy)
        const healthBtn = makeButton("Unlimited Health", () => {
            healthActive = !healthActive;

            if (healthActive) {
                if (!healthProxyEnabled) {
                    healthProxyEnabled = true;
                    originalStep = vm.runtime._step;

                    vm.runtime._step = new Proxy(originalStep, {
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
                }

                healthBtn.textContent = "Unlimited Health (active)";
            } else {
                if (healthProxyEnabled) {
                    vm.runtime._step = originalStep;
                    healthProxyEnabled = false;
                }

                healthBtn.textContent = "Unlimited Health";
            }
        });

    });
})();
