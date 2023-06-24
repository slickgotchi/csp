import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld, defineQuery, hasComponent } from "bitecs";
import { Player } from "../../../componets/Player";
import { ServerMessage } from "../../../componets/ServerMessage";
import { ClientPlayerInput } from "../../../componets/ClientPlayerInput";
import { applyMoveInput, pending_inputs, playDashAnim } from "../../ClientPlayerInputSystem";
import { ping } from "../../PingSystem";
import { getEidFromServerEid } from ".";
import { sPlayer } from "../../../../../../server/src/types/sPlayer";
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack";
import { Transform } from "../../../componets/Transform";
import { saveBuffer } from "../../InterpolateSystem";
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";

export const playerMoveRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    // console.log('move');
    // find the player
    const eid = getEidFromServerEid(world, message.payload.serverEid);
    const go = room.state.gameObjects.get(message.payload.serverEid.toString()) as sPlayer;
    
    if (eid && go) {
        
        if (go.sessionId !== room.sessionId) {
            // check blockers
            // if (GA_RangedAttack.activated[eid]) return;
            // set authourative state
            Transform.x[eid] = message.payload.x;
            Transform.y[eid] = message.payload.y;
            saveBuffer(room, eid);
        } else {
            // update transform with authrative state
            Transform.x[eid] = message.payload.x;
            Transform.y[eid] = message.payload.y;
    
            // do server reconciliation
            let j = 0;
            while (j < pending_inputs.length) {
                const input = pending_inputs[j];
                if (input.id <= message.payload.last_processed_input) {
                    pending_inputs.splice(j,1);
                } else {
                    applyMoveInput(eid, input);
                    separateFromStaticColliders(eid, collidersByEid.get(eid));
                    j++;
                }
            }
            
        }
    }
}