import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld, defineQuery } from "bitecs";
import { ServerMessage } from "../../../componets/ServerMessage";
import { sPlayer } from "../../../../../../server/src/types/sPlayer";
import { sEnemy } from "../../../../../../server/src/types/sEnemy";
import { Transform } from "../../../componets/Transform";
import { saveBuffer } from "../../InterpolateSystem";
import { applyInput, pending_inputs, resolveCollisions } from "../../ClientPlayerInputSystem";

const onUpdate = defineQuery([ServerMessage]);

export const serverUpdateRoute = (message: IMessage, room: Room, world: IWorld) => {
    onUpdate(world).forEach(eid => {
        const serverEid = ServerMessage.serverEid[eid].toString();
        const go = room.state.gameObjects.get(serverEid);
        switch (go?.type) {
            case 'player': {
                handlePlayerUpdate(room, go as sPlayer, eid);
                break;
            }
            case 'enemy': {
                handleEnemyUpdate(go as sEnemy, eid);
                break;
            }
            default: break;
        }
    });
}


const handlePlayerUpdate = (room: Room, go: sPlayer, eid: number) => {
    const playerGo = go as sPlayer;
    if (playerGo.sessionId !== room.sessionId) {
        Transform.x[eid] = go.x;
        Transform.y[eid] = go.y;
        saveBuffer(eid);
    } else {
        // update transform with authrative state
        Transform.x[eid] = go.x;
        Transform.y[eid] = go.y;

        // if server recon do recon
        if (ServerMessage.isServerReconciliation[eid]) {
            let j = 0;
            while (j < pending_inputs.length) {
                const input = pending_inputs[j];
                if (input.id <= (go as sPlayer).last_processed_input) {
                    pending_inputs.splice(j,1);
                } else {
                    applyInput(eid, input);
                    resolveCollisions(eid);
                    j++;
                }
            }
        }
    }
}

const handleEnemyUpdate = (go: sEnemy, eid: number) => {
    Transform.x[eid] = go.x;
    Transform.y[eid] = go.y;
    saveBuffer(eid);
}