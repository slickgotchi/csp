import { IWorld, defineQuery, defineSystem } from "bitecs";
import GameRoom from "../../../../rooms/Game";
import { ASC_Enemy } from "../../../components/gas/ability-system-components/ASC_Enemy";
import { Timer } from "../../../../utilities/Timer";
import { ArcUtils } from "../../../../utilities/ArcUtils";
import { sEnemy } from "../../../../types/sEnemy";
import { Transform } from "../../../components/Transform";



export const createASC_EnemySystem = (room: GameRoom) => {

    const onUpdate = defineQuery([ASC_Enemy]);

    const timer = new Timer();

    return defineSystem((world: IWorld) => {

        timer.tick();

        onUpdate(world).forEach(eid => {
            const enemyGo = room.state.gameObjects.get(eid.toString()) as sEnemy;
            enemyGo.timer_ms -= timer.dt_ms;
            if (enemyGo.timer_ms <= 0) {
                // change direction
                const v = ArcUtils.Vector2.normalise({x:Math.random()-0.5, y:Math.random()-0.5});
                enemyGo.dx = v.x;
                enemyGo.dy = v.y;

                enemyGo.timer_ms = Math.random()*3000 + 1000;
            }
            Transform.x[eid] += enemyGo.dx * 150 * timer.dt_ms * 0.001;
            Transform.y[eid] += enemyGo.dy * 150 * timer.dt_ms * 0.001;
        });

        return world;
    })
}