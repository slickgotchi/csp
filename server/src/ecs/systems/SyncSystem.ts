import { IWorld, defineQuery, defineSystem } from "bitecs"
import { Sync } from "../components/Sync"
import GameRoom from "../../rooms/Game";
import { Transform } from "../components/Transform";
import { Timer } from "../../utilities/Timer";
import { ArcUtils } from "../../utilities/ArcUtils";




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

                go.accum_ms += timer.dt_ms;
                const lerp = go.accum_ms / 100;

                go.interpX = ArcUtils.Scalar.lerp(go.prevX, go.currX, lerp);
                go.interpY = ArcUtils.Scalar.lerp(go.prevY, go.currY, lerp);
            }
        });

        return world;
    })
}