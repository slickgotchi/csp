import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld, defineQuery, hasComponent } from "bitecs";
import { Player } from "../../../componets/Player";
import { ServerMessage } from "../../../componets/ServerMessage";
import { ClientPlayerInput } from "../../../componets/ClientPlayerInput";
import { playDashAnim } from "../../ClientPlayerInputSystem";

const onUpdate = defineQuery([Player]);

export const playerDashRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    onUpdate(world).forEach(eid => {
        if (!hasComponent(world, ClientPlayerInput, eid)) {
            if (ServerMessage.serverEid[eid] === message.payload.serverEid) {
                console.log(message);
                playDashAnim(scene, message.payload.start, message.payload.finish, eid, 100);
            }
        }
    })


    // onUpdate(world).forEach(eid => {
    //     const serverEid = ServerMessage.serverEid[eid].toString();
    //     const go = room.state.gameObjects.get(serverEid);
    //     switch (go?.type) {
    //         case 'player': {
    //             handlePlayerUpdate(room, go as sPlayer, eid);
    //             break;
    //         }
    //         case 'enemy': {
    //             handleEnemyUpdate(go as sEnemy, eid);
    //             break;
    //         }
    //         default: break;
    //     }
    // });
}