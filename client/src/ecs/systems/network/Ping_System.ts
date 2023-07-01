import { IWorld } from "bitecs";
import { Room } from "colyseus.js";
import { GameScene } from "../../../internalExports";

export let ping = 0;

export const createPing_System = (gScene: GameScene) => {

    const ping_buffer: number[] = [];
    
    gScene.room.onMessage('server-ping', client_time_ms => {
        const now = Date.now();
        ping_buffer.push(now - client_time_ms);
        gScene.room.send('ping-server', now);

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

    gScene.room.send('ping-server', Date.now());

    const text = gScene.add.text(60, 60, "Ping: ", {fontSize: "36px"});

    return ((world: IWorld) => {

        text.setText(`Ping: ${ping.toFixed()}ms`)

        return world;
    });
}