import { IWorld, defineQuery, defineSystem } from "bitecs";
import GameRoom from "../../rooms/Game";
import { Timer } from "../../utilities/Timer";
import { ASC_Player } from "../components/gas/ability-system-components/ASC_Player";



export const createSendWorldStateSystem = (room: GameRoom) => {

    const onUpdatePlayer = defineQuery([ASC_Player]);

    const EMIT_INTERVAL_MS = 100;
    let accum = 0;
    const timer = new Timer();

    return defineSystem((world: IWorld) => {

        timer.tick();

        accum += timer.dt_ms;

        while (accum >= EMIT_INTERVAL_MS) {
            room.broadcast('server-update');
            accum -= EMIT_INTERVAL_MS;

            // update interpolation for player objects
            onUpdatePlayer(world).forEach(eid => {
                const go = room.state.gameObjects.get(eid.toString());
                if (go) {
                    go.prevX = go.currX;
                    go.prevY = go.currY;
                    go.currX = go.x;
                    go.currY = go.y;
                    go.accum_ms = 0;
                }
            });
        }


        return world;
    })
}