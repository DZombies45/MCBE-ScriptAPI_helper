import { world } from "@minecraft/server";
import { SIGNAL } from "./dz-signal";
export class SBDB {
    oB;
    data = {};
    ready = false;
    name;
    readyCallbacks = [];
    constructor(name = "dz:setting") {
        this.name = name;
        world.afterEvents.worldLoad.subscribe(() => {
            try {
                this.oB =
                    world.scoreboard.getObjective(this.name) ||
                        world.scoreboard.addObjective(this.name, this.name);
                this.reload();
                this.ready = true;
                this.readyCallbacks.forEach((fn) => fn());
                SIGNAL.connect("setting", (data) => {
                    if (data.value !== "reload")
                        return;
                    this.reload();
                    this.readyCallbacks.forEach((fn) => fn());
                });
            }
            catch (e) {
                console.warn("SBDB init error:", e);
            }
        });
    }
    reload() {
        if (!this.oB)
            return;
        this.data = {};
        for (const o of this.oB.getParticipants()) {
            const match = o.displayName.match(/^([^:]*):(.*)/);
            if (match)
                this.data[match[1]] = match[2];
        }
    }
    removeData(id) {
        if (!this.oB)
            return;
        for (const o of this.oB.getParticipants()) {
            const match = o.displayName.match(/^([^:]*):(.*)/);
            if (match && match[1] === id)
                this.oB.removeParticipant(match[0]);
        }
    }
    onReady(fn) {
        if (this.ready)
            fn();
        else
            this.readyCallbacks.push(fn);
    }
    set(id, value) {
        if (!this.ready || !this.oB)
            return;
        this.removeData(id);
        this.oB.addScore(`${id}:${value}`, 0);
        this.reload();
        SIGNAL.emit("setting", "reload", "");
    }
    delete(id) {
        if (!this.ready || !this.oB)
            return;
        const old = this.data[id];
        if (old)
            this.oB.removeParticipant(`${id}:${old}`);
        this.reload();
        SIGNAL.emit("setting", "reload", "");
    }
    get(id) {
        return this.data[id] || "";
    }
    has(id) {
        return !!this.data[id];
    }
    isReady() {
        return this.ready;
    }
}
