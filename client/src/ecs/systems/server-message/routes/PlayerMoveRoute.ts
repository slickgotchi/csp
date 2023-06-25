import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld } from "bitecs";
import { pending_inputs } from "../../ClientPlayerInputSystem";
import { getEidFromServerEid } from ".";
import { sPlayer } from "../../../../../../server/src/types/sPlayer";
import { Transform } from "../../../componets/Transform";
import { saveBuffer } from "../../InterpolateSystem";
import { applyInputGA_Move } from "../../gas/gameplay-abilities/GA_MoveSystem";
import { applyInputGA_Null } from "../../gas/gameplay-abilities/GA_NullSystem";
import { applyInputGA_Dash } from "../../gas/gameplay-abilities/GA_DashSystem";
import { applyInputGA_MeleeAttack } from "../../gas/gameplay-abilities/GA_MeleeAttackSystem";
import { applyInputGA_RangedAttack } from "../../gas/gameplay-abilities/GA_RangedAttackSystem";
import { applyInputGA_PortalMageAxe } from "../../gas/gameplay-abilities/GA_PortalMageAxe";

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
                    const applyInput = (applyInputRoutes as any)[input.targetGA];
                    applyInput(eid, input);
                    j++;
                }
            }
        }
    }
}

const applyInputRoutes = {
    "GA_Null": applyInputGA_Null,
    "GA_Move": applyInputGA_Move,
    "GA_Dash": applyInputGA_Dash,
    "GA_MeleeAttack": applyInputGA_MeleeAttack,
    "GA_RangedAttack": applyInputGA_RangedAttack,
    "GA_PortalMageAxe": applyInputGA_PortalMageAxe
}