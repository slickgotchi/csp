import { IWorld } from "bitecs";
import { Room } from "colyseus.js";

export let ping = 0;

export const createPingSystem = (room: Room, scene: Phaser.Scene) => {

    const ping_buffer: number[] = [];
    
    room.onMessage('server-ping', client_time_ms => {
        const now = Date.now();
        ping_buffer.push(now - client_time_ms);
        room.send('ping-server', now);

        if (ping_buffer.length > 10) {
            ping_buffer.shift();
        }
        let sum = 0;
        ping_buffer.forEach(p => {
            sum += p;
        });
        if (ping_buffer.length > 0) {
            ping = sum / ping_buffer.length;
        }
    });

    room.send('ping-server', Date.now());

    const text = scene.add.text(60, 60, "Ping: ", {fontSize: "36px"});

    return ((world: IWorld) => {

        text.setText(`Ping: ${ping.toFixed()}ms`)

        return world;
    });
}