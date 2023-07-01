import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessage_System";
import { IWorld, defineQuery, hasComponent } from "bitecs";
import { ASC_Enemy_Component } from "../../../componets/gas/ability-system-components/ASC_Enemy_Component";
import { Color_Component } from "../../../componets/render/Color_Component";

const onUpdate = defineQuery([ASC_Enemy_Component]);

export const tintFlash = (eid: number) => {
    Color_Component.val[eid] = 0xffffff;
    setTimeout(() => { Color_Component.val[eid] = 0xff6666 }, 150)
    setTimeout(() => { Color_Component.val[eid] = 0xffffff }, 300)
    setTimeout(() => { Color_Component.val[eid] = 0xff6666 }, 450)
}

export const enemyTakeDamageRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    // onUpdate(world).forEach(eid => {
    //     if (ServerMessage.serverEid[eid] === message.payload.serverEid) {
    //         tintFlash(eid);
    //     }
    // })
    
    setTimeout(() => {
        createDamagePopup(scene, message.payload.damage, message.payload.x, message.payload.y);
    }, 0);
}

export const createDamagePopup = (scene: Phaser.Scene, damage: number, x: number, y: number) => {
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