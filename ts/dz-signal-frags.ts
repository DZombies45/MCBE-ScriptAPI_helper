import { ScriptEventSource, system } from "@minecraft/server";

// ----- types

type requestData = {
  id: string; // id yang ingin di call
  requesterId: string; // id sender
  value: any; // isi requesan
  i: number; // fragmen index
  t: number; // total fragment
};

type callbackF = (data: requestData) => void;

type fragmentData = {
  id: string;
  requesterId: string;
  values: string[];
  total: number;
  timeout: number;
};

// ----- default

const FragmentChunk = 512;

const callbackDefault = (data: requestData) => {
  console.warn(
    `signal rechived id: ${data.id},${data.requesterId === "" ? "" : ` and sender: ${data.requesterId}`} that contains: ${data.value}, fragmen ${data.i} of ${data.t}`,
  );
};

function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.substring(i, i + size));
  }
  return chunks;
}

// ----- signal maneger

export class SignalManager {
  private signalPending: Map<string, callbackF> = new Map();
  private signalConnented: Map<string, Set<callbackF>> = new Map();
  private namespace: string = "dz";
  private signalId: string = "";
  private fragmentRechive: Map<string, fragmentData> = new Map();
  private static readonly Timeout: number = 100;
  constructor(namespace: string = "dz", signal: string = "signal") {
    this.namespace = namespace;
    this.signalId = `${namespace}:${signal}`;
    this.start();
  }
  public emitAndListent(id: string, value: any): Promise<requestData> {
    return new Promise((resolve, reject) => {
      const requestId: string = Math.random().toString(36).substring(2, 12);

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
  public emit(id: string, value: any, requesterId: string = ""): void {
    const data: requestData = {
      id,
      requesterId,
      value: "",
      t: 100,
      i: 100,
    };
    const chunkStartLenth = JSON.stringify(data).length;
    const chunks = chunkString(
      JSON.stringify({ v: value }),
      FragmentChunk - chunkStartLenth,
    ); // Adjust size as needed
    data.t = chunks.length - 1;

    chunks.forEach((chunk, index) => {
      data.value = chunk;
      data.i = index;
      system.sendScriptEvent(this.signalId, JSON.stringify(data));
    });
  }
  public connect(id: string, callback: callbackF = callbackDefault): boolean {
    let listeners = this.signalConnented.get(id);
    if (!listeners) {
      listeners = new Set();
      this.signalConnented.set(id, listeners);
    }
    listeners.add(callback);
    return true;
  }
  public disconnect(id: string): boolean {
    if (!this.signalConnented.has(id)) return false;
    this.signalConnented.delete(id);
    return true;
  }
  private start(): void {
    system.afterEvents.scriptEventReceive.subscribe(
      ({ id, message, sourceType }) => {
        try {
          if (id !== this.signalId || sourceType !== ScriptEventSource.Server)
            return;

          const data: requestData = JSON.parse(message);

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

          if (buffer.values.filter(Boolean).length - 1 !== buffer.total) return;

          system.clearRun(buffer.timeout);

          data.value = JSON.parse(buffer.values.join(""))?.v;

          const listeners = this.signalConnented.get(data.id);
          if (listeners)
            for (const listener of listeners) {
              try {
                listener(data);
              } catch (e) {
                console.error(`[Signal:${data.id}] listener error`, e);
              }
            }

          if (this.signalPending.has(data.id)) {
            const pending = this.signalPending.get(data.id);
            if (pending)
              try {
                pending(data);
                this.signalPending.delete(data.id);
              } catch (e) {
                console.error(`[Signal:${data.id}] pending error`, e);
              }
          }
        } catch (e) {
          console.error(`[${this.signalId}] error: ${e}`);
        }
      },
      { namespaces: [this.namespace] },
    );
  }
}

export const SIGNAL = new SignalManager("dz", "signal");
