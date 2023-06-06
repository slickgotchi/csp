import { IWorld, defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs"
import { Room } from "colyseus.js";
import { Player } from "../componets/Player";
import { Transform } from "../componets/Transform";
import { IInput, applyInput, pending_inputs } from "./ClientInputSystem";
import { ServerMessage } from "../componets/ServerMessage";

export interface IMessage {
    name: string;
    payload: {
        gameObject: any;
        last_processed_input: number;
    }
    recv_ms: number;
}

// const messages: any[] = [];
const messagesByEid = new Map<number, IMessage[]>();

export const createServerMessageSystem = (room: Room, world: IWorld) => {

    const onUpdate = defineQuery([Player]);
    const onAdd = enterQuery(onUpdate);
    const onRemove = exitQuery(onUpdate);

    room.onMessage('server-update', payload => {
        onUpdate(world).forEach(eid => {
            const messages = messagesByEid.get(eid);
            if (messages) {
                messages.push({
                    name: 'server-update',
                    payload: payload,
                    recv_ms: Date.now()
                });
            }
        })
    });

    return defineSystem((world: IWorld) => {
        onAdd(world).forEach(eid => {
            messagesByEid.set(eid, []);
        });

        onUpdate(world).forEach(eid => {
            // check for messages
            const messages = messagesByEid.get(eid);
            if (!messages) return;

            // go through messages
            const now = Date.now();
            for (let i = 0; i < messages.length; i++) {
                const message = messages[i];
                if (message.recv_ms <= now) {
                    messages.splice(i,1);

                    // do updates
                    Transform.position.x[eid] = message.payload.gameObject.position.x;
                    Transform.position.y[eid] = message.payload.gameObject.position.y;
                    
                    if (ServerMessage.isServerReconciliation[eid]) {
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

        });

        return world;
    })
}