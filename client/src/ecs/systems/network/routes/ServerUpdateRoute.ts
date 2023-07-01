import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessage_System";
import { IWorld, defineQuery } from "bitecs";
import { sEnemy } from "../../../../../../server/src/types/sEnemy";
import { ServerMessage_Component } from "../../../componets/network/ServerMessage_Component";
import { Transform_Component } from "../../../componets/core/Transform_Component";
import { saveBuffer } from "../../render/Interpolate_System";

const onUpdate = defineQuery([ServerMessage_Component]);

export const serverUpdateRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    onUpdate(world).forEach(eid => {
        const serverEid = ServerMessage_Component.serverEid[eid].toString();
        const go = room.state.gameObjects.get(serverEid);
        switch (go?.type) {
            case 'player': {
                // handlePlayerUpdate(room, go as sPlayer, eid);
                break;
            }
            case 'enemy': {
                handleEnemyUpdate(room, go as sEnemy, eid);
                break;
            }
            default: break;
        }
    });
}

const handleEnemyUpdate = (room: Room, go: sEnemy, eid: number) => {
    Transform_Component.x[eid] = go.x;
    Transform_Component.y[eid] = go.y;
    saveBuffer(room, eid);
}