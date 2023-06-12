import { IWorld, defineQuery, defineSystem } from "bitecs"
import { Sync } from "../components/Sync"
import GameRoom from "../../rooms/Game";
import { Transform } from "../components/Transform";




export const createSyncSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([Sync]);

    return defineSystem((world: IWorld) => {

        onUpdate(world).forEach(eid => {
            const go = room.state.gameObjects.get(eid.toString());
            if (go) {
                go.x = Transform.x[eid];
                go.y = Transform.y[eid];
            }
        });

        return world;
    })
}