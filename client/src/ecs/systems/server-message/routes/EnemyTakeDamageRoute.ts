import { Room } from "colyseus.js";
import { IMessage } from "../ServerMessageSystem";
import { IWorld, defineQuery, hasComponent } from "bitecs";
import { Enemy } from "../../../componets/Enemy";
import { ServerMessage } from "../../../componets/ServerMessage";
import { Color } from "../../../componets/Color";

const onUpdate = defineQuery([Enemy]);

export const enemyTakeDamageRoute = (message: IMessage, room: Room, world: IWorld, scene: Phaser.Scene) => {
    onUpdate(world).forEach(eid => {
        if (ServerMessage.serverEid[eid] === message.payload.serverEid) {
            Color.val[eid] = 0xffffff;
            setTimeout(() => { Color.val[eid] = 0xff6666 }, 100)
            setTimeout(() => { Color.val[eid] = 0xffffff }, 200)
            setTimeout(() => { Color.val[eid] = 0xff6666 }, 300)
        }
    })
    
    setTimeout(() => {
        createDamagePopup(scene, message.payload.damage, message.payload.x, message.payload.y);
    }, 0);
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