import { IWorld, defineQuery, defineSystem, enterQuery } from "bitecs"
import { Interpolate } from "../componets/Interpolate";
import { Transform } from "../componets/Transform";
import { Timer } from "../../utilities/Timer";
import { ArcUtils } from "../../utilities/ArcUtils";
import { interp_dt_ms, position_buffer, setInterpDtMs } from "./ClientInputSystem";

interface IPosition {
    x: number;
    y: number;
    timestamp: number;
}


export const createInterpolateSystem = () => {

    const onUpdate = defineQuery([Interpolate]);
    const onAdd = enterQuery(onUpdate);

    const interpByEid = new Map<number, number>();

    const timer = new Timer();

    return defineSystem((world: IWorld) => {

        timer.tick();

        onAdd(world).forEach(eid => {
            interpByEid.set(eid, 0);
        });

        onUpdate(world).forEach(eid => {
            // update interp
            setInterpDtMs(interp_dt_ms+timer.dt_ms);

            let length = position_buffer.length;
            let a = length-2;
            let b = length-1;

            if (length > 1) {
                const delta_ms = position_buffer[b].timestamp - position_buffer[a].timestamp;
                const interp = interp_dt_ms / delta_ms;

                Interpolate.x[eid] = ArcUtils.Scalar.lerp(position_buffer[a].x, position_buffer[b].x, interp);
                Interpolate.y[eid] = ArcUtils.Scalar.lerp(position_buffer[a].y, position_buffer[b].y, interp);
            
                while (position_buffer.length > 1) {
                    position_buffer.shift();
                }
            }
        })

        return world;
    })
}