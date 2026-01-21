# this is my take for cross addon data share

this system is for sending and rechiving data from other or same addon.
I use a signal system like godot signal, it basicly broadcast script event command with spesific id with its data.

for now i use this on [shome](https://www.curseforge.com/minecraft-bedrock/scripts/shome-addon-1) and [tpr](https://www.curseforge.com/minecraft-bedrock/scripts/dz-tpr) addon to share setting

thare is 2 type of signal that i make, [normal](../ts/dz-signal.ts) and [chunk/fragment](../ts/dz-signal-frags.ts) system that split its data into multiple chunk.
but the 2 version use and return the same data. just the method is diffrence.

> how to use this:
>
> - [id](./id/signal.md)
> - [en](./en/signal.md)
