import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld, defineQuery, hasComponent } from "bitecs";
import { Player } from "../../../componets/Player";
import { ServerMessage } from "../../../componets/ServerMessage";
import { ClientPlayerInput } from "../../../componets/ClientPlayerInput";
import { playDashAnim, playMeleeAttackAnim } from "../../ClientPlayerInputSystem";
import { ping } from "../../PingSystem";
import { Enemy } from "../../../componets/Enemy";

const onUpdate = defineQuery([Enemy]);

export const enemyTakeDamageRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {

    createDamagePopup(scene, message.payload.damage, message.payload.x, message.payload.y);


    // onUpdate(world).forEach(eid => {
    //     if (!hasComponent(world, ClientPlayerInput, eid)) {
    //         if (ServerMessage.serverEid[eid] === message.payload.serverEid) {
    //             setTimeout(() => {
    //                 playMeleeAttackAnim(
    //                     scene, 
    //                     message.payload.start, 
    //                     message.payload.dir, 
    //                     200);

    //             },ping/2 + 100 + 100)
    //         }
    //     }
    // })
}

const createDamagePopup = (scene: Phaser.Scene, damage: number, x: number, y: number) => {
    const damageText = scene.add.text(
        x,
        y-30,
        damage.toString()
    )
    damageText.setOrigin(0.5,0.5);
    damageText.setFontSize(50);

    scene.add.tween({
        targets: damageText,
        alpha: 0,
        y: y-130,
        duration: 1000,
        onComplete: () => {
            damageText.destroy();
        }
    })
}