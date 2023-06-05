import { IWorld, defineQuery, defineSystem } from "bitecs"
import { Room } from "colyseus.js";
import { Player } from "../componets/Player";
import { Transform } from "../componets/Transform";

const messages: any[] = [];

export const createServerMessageSystem = (room: Room) => {

    const qPlayer = defineQuery([Player]);

    room.onMessage('server-update', payload => {
        messages.push({
            name: 'server-update',
            payload: payload,
            recv_ms: Date.now()
        });
    });

    return defineSystem((world: IWorld) => {

        qPlayer(world).forEach(eid => {
            const now = Date.now();
            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                if (message.recv_ms <= now) {
                    messages.splice(i,1);

                    // do updates
                    Transform.position.x[eid] = message.payload.gameObject.position.x;
                    Transform.position.y[eid] = message.payload.gameObject.position.y;
                }
            }


            Transform.position.x

        });

        return world;
    })
}