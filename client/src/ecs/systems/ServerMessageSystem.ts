import { IWorld, defineQuery, defineSystem } from "bitecs"
import { Room } from "colyseus.js";
import { Player } from "../componets/Player";
import { Transform } from "../componets/Transform";
import { applyInput, pending_inputs } from "./ClientInputSystem";
import { ServerMessage } from "../componets/ServerMessage";

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
                    
                    if (ServerMessage.isServerReconciliation) {
                        // do server reconciliation
                        var j = 0;
                        while (j < pending_inputs.length) {
                            const input = pending_inputs[j];
                            if (input.id <= message.payload.last_processed_input) {
                                pending_inputs.splice(j,1);
                            } else {
                                applyInput(eid, input);
                                j++;
                            }
                        }
                    }
                }
            }


            Transform.position.x

        });

        return world;
    })
}