// js/systems/TargetSystem.js
(function (global) {
    const Game = global.Game || (global.Game = {});
    Game.Systems = Game.Systems || {};

    Game.Systems.TargetSystem = (function () {
        let raycaster;
        let mouse;
        let _enabled = false;

        function init(ctx) {
            console.log("[TargetSystem] init() called with ctx:", ctx);

            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();
            _enabled = true;

            // Attach mouse listener
            document.addEventListener("mousedown", onMouseDown);
        }

        function onMouseDown(e) {
            if (!_enabled) {
                return;
            }

            // only left button
            if (e.button !== 0) return;

            if (!Game.State.camera || !Game.State.renderer) {
                console.warn("[TargetSystem] missing camera/renderer in Game.State");
                return;
            }

            // normalize to NDC
            const rect = Game.State.renderer.domElement.getBoundingClientRect();
            const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

            mouse.set(ndcX, ndcY);

            raycaster.setFromCamera(mouse, Game.State.camera);

            // collect clickable roots from horsemen
            const candidates = [];
            for (const h of Game.State.horsemen || []) {
                if (!h) continue;
                const clickableRoot = h.root || h.mesh || h.group;
                if (clickableRoot) {
                    candidates.push(clickableRoot);
                }
            }

            if (!candidates.length) {
                console.warn("[TargetSystem] no clickable roots on horsemen");
                clearTarget();
                return;
            }

            const intersects = raycaster.intersectObjects(candidates, true);
            console.log("[TargetSystem] intersects length:", intersects.length);

            if (!intersects.length) {
                console.log("[TargetSystem] click -> no intersection with horsemen, clearing target");
                clearTarget();
                return;
            }

            // we hit something, try to resolve which horseman that belongs to
            const hitObj = intersects[0].object;
            console.log("[TargetSystem] first hit object:", hitObj.name || hitObj.type, hitObj);

            const picked = findHorsemanByObject(hitObj);
            if (!picked) {
                console.log("[TargetSystem] couldn't resolve hit back to a horseman, clearing target");
                clearTarget();
                return;
            }

            console.log("[TargetSystem] picked horseman:", picked.name, picked);

            // assign global target
            Game.State.currentTarget = picked;

            // update HUD now
            if (Game.HUD && Game.HUD.setTargetUnit) {
                if (picked.unit) {
                    console.log("[TargetSystem] -> HUD.setTargetUnit", picked.unit, picked.name);
                    Game.HUD.setTargetUnit(picked.unit, picked.name || "Enemy");
                } else {
                    console.warn("[TargetSystem] picked horseman has no .unit");
                }
            } else {
                console.warn("[TargetSystem] HUD.setTargetUnit missing");
            }
        }


        function findHorsemanByObject(obj3d) {
            for (const h of Game.State.horsemen || []) {
                if (!h) continue;
                const clickableRoot = h.root || h.mesh || h.group;
                if (!clickableRoot) continue;

                let cur = obj3d;
                while (cur) {
                    if (cur === clickableRoot) {
                        return h;
                    }
                    cur = cur.parent;
                }
            }
            return null;
        }

        function clearTarget() {
            console.log("[TargetSystem] clearTarget()");

            Game.State.currentTarget = null;

            if (Game.HUD && Game.HUD.clearTargetUnit) {
                Game.HUD.clearTargetUnit();
            }
        }


        function update(dt, ctx) {
            // TODO
        }

        function destroy() {
            console.log("[TargetSystem] destroy()");
            _enabled = false;
            document.removeEventListener("mousedown", onMouseDown);
        }

        return {
            init,
            update,
            destroy
        };
    })();
})(window);
