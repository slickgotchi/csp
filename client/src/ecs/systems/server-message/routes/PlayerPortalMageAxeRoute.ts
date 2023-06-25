import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld, defineQuery, hasComponent } from "bitecs";
import { Player } from "../../../componets/Player";
import { ServerMessage } from "../../../componets/ServerMessage";
import { ClientPlayerInput } from "../../../componets/ClientPlayerInput";
import { getEidFromServerEid } from ".";
import { createDamagePopup, tintFlash } from "./EnemyTakeDamageRoute";
import { Interpolate } from "../../../componets/Interpolate";
import { playAnimGA_PortalMageAxe } from "../../gas/gameplay-abilities/GA_PortalMageAxe";

const onUpdate = defineQuery([Player]);

export const playerPortalMageAxeRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    onUpdate(world).forEach(eid => {
        // play attacks for non clients
        if (!hasComponent(world, ClientPlayerInput, eid)) {
            if (ServerMessage.serverEid[eid] === message.payload.serverEid) {
                setTimeout(() => {
                    playAnimGA_PortalMageAxe(
                        scene, 
                        world,
                        eid,
                        message.payload.start, 
                        message.payload.dir, 
                    );

                },0)
            }
        } else {
            // go through hit enemies
            message.payload.hitEnemies.forEach((he: any) => {
                const enemEid = getEidFromServerEid(world, he.serverEid);
                if (enemEid) {
                    setTimeout(() => {tintFlash(enemEid);}, 100);
                    setTimeout(() => {
                        createDamagePopup(scene, he.damage, Interpolate.x[enemEid], Interpolate.y[enemEid]-25)
                    }, 0);
                    
                }
            });
        }
    })
}