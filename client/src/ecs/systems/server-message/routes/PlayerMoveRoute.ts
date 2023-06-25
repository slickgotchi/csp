import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld, defineQuery, hasComponent } from "bitecs";
import { Player } from "../../../componets/Player";
import { ServerMessage } from "../../../componets/ServerMessage";
import { ClientPlayerInput } from "../../../componets/ClientPlayerInput";
import { IInput, pending_inputs } from "../../ClientPlayerInputSystem";
import { ping } from "../../PingSystem";
import { getEidFromServerEid } from ".";
import { sPlayer } from "../../../../../../server/src/types/sPlayer";
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack";
import { Transform } from "../../../componets/Transform";
import { saveBuffer } from "../../InterpolateSystem";
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";

export const playerMoveRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    // find the player
    const eid = getEidFromServerEid(world, message.payload.serverEid);
    const go = room.state.gameObjects.get(message.payload.serverEid.toString()) as sPlayer;
    
    if (eid && go) {
        // set authorative state
        Transform.x[eid] = message.payload.x;
        Transform.y[eid] = message.payload.y;

        // distinguish between client and other players
        if (go.sessionId !== room.sessionId) {
            // set non client players to authorative position
            saveBuffer(room, eid);
        } else {
            // do server reconciliation
            let j = 0;
            while (j < pending_inputs.length) {
                const input = pending_inputs[j];
                // if (input.targetGA === "GA_Move" || input.targetGA === "GA_Idol") {
                if (input.id <= message.payload.last_processed_input) {
                    pending_inputs.splice(j,1);
                } else {
                    // applyInputGA_Move(eid, input);
                    applyInput(eid, input);
                    j++;
                }
            }
        }
    }
}

export const applyInput = (eid: number, input: IInput) => {
    switch (input.targetGA) {
        case "GA_Null": {
            // do nothing
            break;
        }
        case "GA_Move": {
            Transform.x[eid] += input.dir.x * 400 * 0.1;
            Transform.y[eid] += input.dir.y * 400 * 0.1;
        
            // separate from static colliders
            separateFromStaticColliders(eid, collidersByEid.get(eid));
            break;
        }
        case "GA_Dash": {
            Transform.x[eid] += input.dir.x * 500;
            Transform.y[eid] += input.dir.y * 500;
        
            // separate from static colliders
            separateFromStaticColliders(eid, collidersByEid.get(eid));
            break;
        }
        default: break;
    }
}