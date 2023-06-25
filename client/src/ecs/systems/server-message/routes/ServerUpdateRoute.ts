import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld, defineQuery } from "bitecs";
import { ServerMessage } from "../../../componets/ServerMessage";
import { sPlayer } from "../../../../../../server/src/types/sPlayer";
import { sEnemy } from "../../../../../../server/src/types/sEnemy";
import { Transform } from "../../../componets/Transform";
import { saveBuffer } from "../../InterpolateSystem";

const onUpdate = defineQuery([ServerMessage]);

export const serverUpdateRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    onUpdate(world).forEach(eid => {
        const serverEid = ServerMessage.serverEid[eid].toString();
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
    Transform.x[eid] = go.x;
    Transform.y[eid] = go.y;
    saveBuffer(room, eid);
}