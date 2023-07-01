import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessage_System";
import { IWorld, defineQuery, hasComponent } from "bitecs";
import { getEidFromServerEid } from ".";
import { createDamagePopup, tintFlash } from "./EnemyTakeDamageRoute";
import { GameScene } from "../../../../scenes/GameScene";
import { ASC_Player_Component } from "../../../componets/gas/ability-system-components/ASC_Player_Component";
import { ClientPlayerInput_Component } from "../../../componets/input/ClientPlayerInput_Component";
import { ServerMessage_Component } from "../../../componets/network/ServerMessage_Component";
import { playAnimGA_MeleeAttack } from "../../gas/gameplay-abilities/GA_MeleeAttack_System";
import { Interpolate_Component } from "../../../componets/render/Interpolate_Component";

const onUpdate = defineQuery([ASC_Player_Component]);

export const playerMeleeAttackRoute = (message: IMessage, room: Room, world: IWorld, gScene: GameScene) => {
    onUpdate(world).forEach(eid => {
        // play attacks for non clients
        if (!hasComponent(world, ClientPlayerInput_Component, eid)) {
            if (ServerMessage_Component.serverEid[eid] === message.payload.serverEid) {
                // setTimeout(() => {
                    playAnimGA_MeleeAttack(
                        gScene, 
                        world,
                        eid,
                        message.payload.start, 
                        message.payload.dir, 
                        false
                    );

                // },0)
            }
        } else {
            // go through hit enemies
            message.payload.hitEnemies.forEach((he: any) => {
                const enemEid = getEidFromServerEid(world, he.serverEid);
                if (enemEid) {
                    setTimeout(() => {tintFlash(enemEid);}, 100);
                    setTimeout(() => {
                        createDamagePopup(gScene, he.damage, Interpolate_Component.x[enemEid], Interpolate_Component.y[enemEid]-25)
                    }, 0);
                    
                }
            });
        }
    })
}