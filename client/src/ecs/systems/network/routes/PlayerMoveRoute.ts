import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessage_System";
import { IWorld } from "bitecs";
import { applyMovePlayerInput, pending_inputs } from "../../input/ClientPlayerInput_System";
import { getEidFromServerEid } from ".";
import { sPlayer } from "../../../../../../server/src/types/sPlayer";
import { Transform_Component } from "../../../componets/core/Transform_Component";
import { saveBuffer } from "../../render/Interpolate_System";

export const playerMoveRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    // find the player
    const eid = getEidFromServerEid(world, message.payload.serverEid);
    const go = room.state.gameObjects.get(message.payload.serverEid.toString()) as sPlayer;
    
    if (eid && go) {
        // set authorative state
        Transform_Component.x[eid] = message.payload.x;
        Transform_Component.y[eid] = message.payload.y;

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
                    applyMovePlayerInput(eid, input);
                    j++;
                }
            }
        }
    }
}
