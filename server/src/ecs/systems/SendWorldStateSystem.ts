import { IWorld, defineSystem } from "bitecs";
import GameRoom from "../../rooms/Game";
import { Timer } from "../../utilities/Timer";



export const createSendWorldStateSystem = (room: GameRoom) => {

    const EMIT_INTERVAL_MS = 100;
    let accum = 0;
    const timer = new Timer();

    return defineSystem((world: IWorld) => {

        timer.tick();

        accum += timer.dt_ms;

        while (accum >= EMIT_INTERVAL_MS) {
            room.broadcast('server-update');
            accum -= EMIT_INTERVAL_MS;
        }


        return world;
    })
}