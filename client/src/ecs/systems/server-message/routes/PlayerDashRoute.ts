import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld, hasComponent } from "bitecs";
import { ServerMessage } from "../../../componets/ServerMessage";
import { ClientPlayerInput } from "../../../componets/ClientPlayerInput";

import { ping } from "../../PingSystem";
import { getEidFromServerEid } from ".";
import { sPlayer } from "../../../../../../server/src/types/sPlayer";
import { playDashAnim } from "../../gas/gameplay-abilities/GA_DashSystem";


export const playerDashRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    // find the player
    const eid = getEidFromServerEid(world, message.payload.serverEid);
    const go = room.state.gameObjects.get(message.payload.serverEid.toString()) as sPlayer;
    
    if (eid && go) {
        if (!hasComponent(world, ClientPlayerInput, eid)) {
            if (ServerMessage.serverEid[eid] === message.payload.serverEid) {
                setTimeout(() => {
                    playDashAnim(
                        scene, 
                        message.payload.start, 
                        message.payload.finish
                    );

                },ping/2 + 100 + 100)
            }
        }
    }
    
    
    
    
    // onUpdate(world).forEach(eid => {
    //     if (!hasComponent(world, ClientPlayerInput, eid)) {
    //         if (ServerMessage.serverEid[eid] === message.payload.serverEid) {
    //             setTimeout(() => {
    //                 playDashAnim(
    //                     scene, 
    //                     message.payload.start, 
    //                     message.payload.finish
    //                 );

    //             },ping/2 + 100 + 100)
    //         }
    //     }
    // })
}