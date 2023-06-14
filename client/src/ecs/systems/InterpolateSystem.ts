import { IWorld, defineQuery, defineSystem, enterQuery, hasComponent } from "bitecs"
import { Interpolate } from "../componets/Interpolate";
import { Transform } from "../componets/Transform";
import { Timer } from "../../utilities/Timer";
import { ArcUtils } from "../../utilities/ArcUtils";
import { Enemy } from "../componets/Enemy";
// import { position_buffer } from "./ClientPlayerInputSystem";

interface IPosition {
    x: number;
    y: number;
    timestamp: number;
}

export const saveBuffer = (eid: number) => {
    // update position buffer
    const posBuffer = positionBufferByEid.get(eid);
    if (!posBuffer) return;

    posBuffer.push({
        x: Transform.x[eid],
        y: Transform.y[eid],
        timestamp: Date.now()
    });
    Interpolate.dt_ms[eid] = 0; // reset interpolation time
}

export const positionBufferByEid = new Map<number, IPosition[]>();

export const createInterpolateSystem = () => {

    const onUpdate = defineQuery([Interpolate]);
    const onAdd = enterQuery(onUpdate);

    const interpByEid = new Map<number, number>();

    const timer = new Timer();

    return defineSystem((world: IWorld) => {

        timer.tick();

        onAdd(world).forEach(eid => {
            interpByEid.set(eid, 0);
            positionBufferByEid.set(eid, []);
        });

        onUpdate(world).forEach(eid => {
            // update interp
            Interpolate.dt_ms[eid] += timer.dt_ms;

            // if (hasComponent(world, Enemy, eid))
            // saveBuffer(eid);

            const position_buffer = positionBufferByEid.get(eid);
            if (position_buffer) {
                let length = position_buffer.length;
                let a = length-2;
                let b = length-1;

                if (length > 1) {
                    const delta_ms = position_buffer[b].timestamp - position_buffer[a].timestamp;
                    const interp = Interpolate.dt_ms[eid] / delta_ms;

                    Interpolate.x[eid] = ArcUtils.Scalar.lerp(position_buffer[a].x, position_buffer[b].x, interp);
                    Interpolate.y[eid] = ArcUtils.Scalar.lerp(position_buffer[a].y, position_buffer[b].y, interp);
                
                    while (position_buffer.length > 2) {
                        position_buffer.shift();
                    }
                }
            }
        })

        return world;
    })
}

