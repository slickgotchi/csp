import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessage_System";
import { IWorld, hasComponent } from "bitecs";

import { getEidFromServerEid } from ".";
import { sPlayer } from "../../../../../../server/src/types/sPlayer";
import { playAnimGA_Dash } from "../../gas/gameplay-abilities/GA_Dash_System";
import { ClientPlayerInput_Component } from "../../../componets/input/ClientPlayerInput_Component";
import { ServerMessage_Component } from "../../../componets/network/ServerMessage_Component";
import { ping } from "../Ping_System";


export const playerDashRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    // find the player
    const eid = getEidFromServerEid(world, message.payload.serverEid);
    const go = room.state.gameObjects.get(message.payload.serverEid.toString()) as sPlayer;
    
    if (eid && go) {
        if (!hasComponent(world, ClientPlayerInput_Component, eid)) {
            if (ServerMessage_Component.serverEid[eid] === message.payload.serverEid) {
                setTimeout(() => {
                    playAnimGA_Dash(
                        scene, 
                        message.payload.start, 
                        message.payload.finish
                    );

                },ping/2 + 100 + 100)
            }
        }
    }
}