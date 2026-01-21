import { ScriptEventSource, system } from "@minecraft/server";
// ----- default
const FragmentChunk = 512;
const callbackDefault = (data) => {
    console.warn(`signal rechived id: ${data.id},${data.requesterId === "" ? "" : ` and sender: ${data.requesterId}`} that contains: ${data.value}, fragmen ${data.i} of ${data.t}`);
};
function chunkString(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.substring(i, i + size));
    }
    return chunks;
}
// ----- signal maneger
export class SignalManager {
    signalPending = new Map();
    signalConnented = new Map();
    namespace = "dz";
    signalId = "";
    fragmentRechive = new Map();
    static Timeout = 100;
    constructor(namespace = "dz", signal = "signal") {
        this.namespace = namespace;
        this.signalId = `${namespace}:${signal}`;
        this.start();
    }
    emitAndListent(id, value) {
        return new Promise((resolve, reject) => {
            const requestId = Math.random().toString(36).substring(2, 12);
            const timeout = system.runTimeout(() => {
                this.signalPending.delete(requestId);
                reject(new Error(`Signal timeout: ${id}`));
            }, SignalManager.Timeout);
            this.signalPending.set(requestId, (data) => {
                system.clearRun(timeout);
                resolve(data);
            });
            this.emit(id, value, requestId);
        });
    }
    emit(id, value, requesterId = "") {
        const data = {
            id,
            requesterId,
            value: "",
            t: 100,
            i: 100,
        };
        const chunkStartLenth = JSON.stringify(data).length;
        const chunks = chunkString(JSON.stringify({ v: value }), FragmentChunk - chunkStartLenth); // Adjust size as needed
        data.t = chunks.length - 1;
        chunks.forEach((chunk, index) => {
            data.value = chunk;
            data.i = index;
            system.sendScriptEvent(this.signalId, JSON.stringify(data));
        });
    }
    connect(id, callback = callbackDefault) {
        let listeners = this.signalConnented.get(id);
        if (!listeners) {
            listeners = new Set();
            this.signalConnented.set(id, listeners);
        }
        listeners.add(callback);
        return true;
    }
    disconnect(id) {
        if (!this.signalConnented.has(id))
            return false;
        this.signalConnented.delete(id);
        return true;
    }
    start() {
        system.afterEvents.scriptEventReceive.subscribe(({ id, message, sourceType }) => {
            try {
                if (id !== this.signalId || sourceType !== ScriptEventSource.Server)
                    return;
                const data = JSON.parse(message);
                let buffer = this.fragmentRechive.get(data.id);
                if (!buffer) {
                    buffer = {
                        id: data.id,
                        requesterId: data.requesterId,
                        values: new Array(data.t),
                        total: data.t,
                        timeout: system.runTimeout(() => {
                            this.fragmentRechive.delete(data.id);
                        }, 100),
                    };
                    this.fragmentRechive.set(data.id, buffer);
                }
                buffer[data.i] = data.value;
                if (buffer.values.filter(Boolean).length - 1 !== buffer.total)
                    return;
                system.clearRun(buffer.timeout);
                data.value = JSON.parse(buffer.values.join(""))?.v;
                const listeners = this.signalConnented.get(data.id);
                if (listeners)
                    for (const listener of listeners) {
                        try {
                            listener(data);
                        }
                        catch (e) {
                            console.error(`[Signal:${data.id}] listener error`, e);
                        }
                    }
                if (this.signalPending.has(data.id)) {
                    const pending = this.signalPending.get(data.id);
                    if (pending)
                        try {
                            pending(data);
                            this.signalPending.delete(data.id);
                        }
                        catch (e) {
                            console.error(`[Signal:${data.id}] pending error`, e);
                        }
                }
            }
            catch (e) {
                console.error(`[${this.signalId}] error: ${e}`);
            }
        }, { namespaces: [this.namespace] });
    }
}
export const SIGNAL = new SignalManager("dz", "signal");
