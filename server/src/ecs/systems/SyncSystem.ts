import { IWorld, defineQuery, defineSystem, hasComponent } from "bitecs"
import { Sync } from "../components/Sync"
import GameRoom from "../../rooms/Game";
import { Transform } from "../components/Transform";
import { Timer } from "../../utilities/Timer";
import { ArcUtils } from "../../utilities/ArcUtils";
import { ASC_Player } from "../components/gas/ability-system-components/ASC_Player";
import { sPlayer } from "../../types/sPlayer";
import { GA_Move } from "../components/gas/gameplay-abilities/GA_Move";




export const createSyncSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([Sync]);

    const timer = new Timer();

    return defineSystem((world: IWorld) => {

        timer.tick();

        onUpdate(world).forEach(eid => {
            const go = room.state.gameObjects.get(eid.toString());
            if (go) {
                go.x = Transform.x[eid];
                go.y = Transform.y[eid];

                
                // go.interpX = ArcUtils.Scalar.lerp(go.prevX, go.currX, lerp);
                // go.interpY = ArcUtils.Scalar.lerp(go.prevY, go.currY, lerp);
                
                const playerGo = go as sPlayer;
                if (hasComponent(world, ASC_Player, eid) && playerGo) {
                    go.accum_ms += timer.dt_ms;
                    const lerp = go.accum_ms / 100;

                    // 
                    playerGo.smoothX = Transform.x[eid] - GA_Move.dx[eid] * (1-lerp);
                    playerGo.smoothY = Transform.y[eid] - GA_Move.dy[eid] * (1-lerp);
                    // console.log(lerp);  
                }
            }
        });

        return world;
    })
}