import { IWorld, addComponent, defineQuery, defineSystem } from "bitecs";
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack";


export const createGA_RangedAttackSystem = (scene: Phaser.Scene, world: IWorld) => {

    const onUpdate = defineQuery([GA_RangedAttack]);

    return defineSystem((world: IWorld) => {

        onUpdate(world).forEach(eid => {
            if (GA_RangedAttack.activated[eid]) {
                setTimeout(() => {
                    GA_RangedAttack.activated[eid] = 0;
                }, 200)
            }
        })

        return world;
    })
}




export const playRangedAttackAnim = (scene: Phaser.Scene, world: IWorld, eid: number, start: {x:number,y:number}, dir: {x:number,y:number}) => {
    // create circle
    const circ = scene.add.circle(
        start.x + dir.x * 85,
        start.y + dir.y * 85,
        35,
        0xffffff
    );
    circ.setAlpha(0.75);
    
    // tween
    scene.add.tween({
        targets: circ,
        x: start.x + dir.x*1000,
        y: start.y + dir.y*1000,
        duration: 250,
        onComplete: () => {
            circ.destroy();
        }
    });

    GA_RangedAttack.activated[eid] = 1;
}