---
# SignalManager Documentation

Event-based signal and request–reply system for **Minecraft Script API**, inspired by **Godot Signals**.
---

## Core Concepts

SignalManager provides two communication patterns:

1. **Signal (Broadcast Event)**
   Similar to Godot signals: one event, multiple listeners.

2. **Request–Reply (One-shot)**
   Lightweight RPC-style communication: send a request and await **a single reply** via `Promise`.

Both patterns are built on top of `system.sendScriptEvent`.

---

## Key Terminology

| Term          | Description                     |
| ------------- | ------------------------------- |
| `id`          | Signal / event name             |
| `requesterId` | Reply channel identifier        |
| listener      | Callback attached to a signal   |
| one-shot      | Listener that is used only once |

---

## Installation

Ensure your addon imports the Script API:

```ts
import { system } from "@minecraft/server";
```

Use the singleton instance:

```ts
import { SIGNAL } from "./SignalManager";
```

---

## 1. Emit a Signal (Broadcast)

Send an event to all listeners connected to a signal `id`.

```ts
SIGNAL.emit("player_hit", { damage: 4 });
```

Characteristics:

- No return value
- No Promise
- Ideal for pure events

---

## 2. Connect to a Signal (Multi-listener)

Attach a callback to a signal.

```ts
SIGNAL.connect("player_hit", (data) => {
  console.log(data.value.damage);
});
```

### Notes

- A single `id` can have multiple listeners
- All listeners are called whenever the signal is emitted

---

## 3. Disconnect from a Signal

### Remove all listeners for a signal

```ts
SIGNAL.disconnect("player_hit");
```

### Remove a specific listener

```ts
const cb = (data) => {};
SIGNAL.connect("player_hit", cb);
SIGNAL.disconnect("player_hit", cb);
```

---

## 4. Request–Reply (Async, One-shot)

Send a signal and **await a single reply**.

```ts
const result = await SIGNAL.emitAndListent("get_health", player.id);
console.log(result.value);
```

Characteristics:

- Returns a `Promise`
- Automatically times out
- Reply listener is used only once

---

## 5. Handling Requests and Sending Replies

Receivers do **not** need to know about Promises.

```ts
SIGNAL.connect("get_health", (data) => {
  const health = 20;

  // reply to requester
  SIGNAL.emit(data.requesterId, health);
});
```

### Flow

1. Requester calls `emitAndListent`
2. Receiver receives the signal
3. Receiver sends a reply to `requesterId`
4. Promise resolves automatically

---

## 6. Timeout Behavior

If no reply is received within the timeout window:

- The Promise is rejected
- Pending request data is cleaned up

```ts
try {
  await SIGNAL.emitAndListent("get_data", 123);
} catch (e) {
  console.warn("Request timeout");
}
```

---

## 7. Signal vs Request–Reply

| Signal             | Request–Reply            |
| ------------------ | ------------------------ |
| Broadcast          | One-to-many              |
| Synchronous-style  | Asynchronous (`Promise`) |
| Multiple listeners | Single first reply       |
| Event-driven       | Lightweight RPC          |

---

## Best Practices

- Use **signals** for events (hit, death, tick)
- Use **request–reply** for querying data
- Avoid storing long-lived state in listeners
- Always reply using `requesterId`

---

## Mental Model (Important)

- `sendScriptEvent` = global broadcast bus
- `SignalManager` = local router
- `requesterId` = reply channel

---

