---
# Dokumentasi SignalManager (Bahasa Indonesia)

Sistem signal berbasis event dan request–reply untuk **Minecraft Script API**, terinspirasi dari **Godot Signal**.
---

## Konsep Dasar

SignalManager menyediakan dua pola komunikasi:

1. **Signal (Broadcast Event)**
   Seperti Godot signal: satu event, banyak listener.

2. **Request–Reply (One-shot)**
   Mirip RPC ringan: kirim request lalu menunggu **satu balasan** melalui `Promise`.

Keduanya berjalan di atas `system.sendScriptEvent`.

---

## Istilah Penting

| Istilah       | Penjelasan                         |
| ------------- | ---------------------------------- |
| `id`          | Nama signal / event                |
| `requesterId` | Channel untuk balasan              |
| listener      | Callback yang terhubung ke signal  |
| one-shot      | Listener yang hanya dipakai sekali |

---

## Instalasi

Pastikan addon mengimpor Script API:

```ts
import { system } from "@minecraft/server";
```

Gunakan instance singleton:

```ts
import { SIGNAL } from "./SignalManager";
```

---

## 1. Emit Signal (Broadcast)

Mengirim event ke semua listener yang terhubung ke `id`.

```ts
SIGNAL.emit("player_hit", { damage: 4 });
```

Karakteristik:

- Tidak mengembalikan nilai
- Tidak async
- Cocok untuk event murni

---

## 2. Connect Signal (Multi-listener)

Menghubungkan callback ke sebuah signal.

```ts
SIGNAL.connect("player_hit", (data) => {
  console.log(data.value.damage);
});
```

Catatan:

- Satu `id` bisa memiliki banyak listener
- Semua listener dipanggil setiap signal di-emit

---

## 3. Disconnect Signal

### Melepas semua listener

```ts
SIGNAL.disconnect("player_hit");
```

### Melepas listener tertentu

```ts
const cb = (data) => {};
SIGNAL.connect("player_hit", cb);
SIGNAL.disconnect("player_hit", cb);
```

---

## 4. Request–Reply (Async, One-shot)

Mengirim signal dan **menunggu satu balasan**.

```ts
const result = await SIGNAL.emitAndListent("get_health", player.id);
console.log(result.value);
```

Karakteristik:

- Mengembalikan `Promise`
- Otomatis timeout
- Listener balasan hanya satu kali

---

## 5. Menangani Request dan Mengirim Balasan

Receiver **tidak perlu tahu Promise**.

```ts
SIGNAL.connect("get_health", (data) => {
  const health = 20;

  // balas ke requesterId
  SIGNAL.emit(data.requesterId, health);
});
```

Alur:

1. Requester memanggil `emitAndListent`
2. Receiver menerima signal
3. Receiver membalas ke `requesterId`
4. Promise resolve otomatis

---

## 6. Perilaku Timeout

Jika balasan tidak diterima dalam waktu tertentu:

- Promise akan `reject`
- Data pending dibersihkan

```ts
try {
  await SIGNAL.emitAndListent("get_data", 123);
} catch (e) {
  console.warn("Request timeout");
}
```

---

## 7. Perbedaan Signal vs Request–Reply

| Signal          | Request–Reply        |
| --------------- | -------------------- |
| Broadcast       | Satu ke banyak       |
| Event           | Async (`Promise`)    |
| Banyak listener | Satu balasan pertama |
| Event-driven    | RPC ringan           |

---

## Best Practice

- Gunakan **signal** untuk event (hit, death, tick)
- Gunakan **request–reply** untuk query data
- Jangan simpan state jangka panjang di listener
- Selalu balas menggunakan `requesterId`

---

## Mental Model (Penting)

- `sendScriptEvent` = bus broadcast global
- `SignalManager` = router lokal
- `requesterId` = channel balasan

---

