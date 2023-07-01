import { IWorld, defineQuery, defineSystem, enterQuery, hasComponent } from "bitecs"
import { Room } from "colyseus.js";
import { Transform_Component } from "../../componets/core/Transform_Component";
import { Interpolate_Component } from "../../componets/render/Interpolate_Component";
import { Timer } from "../../../utilities/Timer";
import { ClientPlayerInput_Component } from "../../componets/input/ClientPlayerInput_Component";
import { ArcUtils } from "../../../utilities/ArcUtils";
import { ping } from "../network/Ping_System";


interface IPosition {
    x: number;
    y: number;
    clientTime_ms: number;
    serverTime_ms: number;
}

let clientTime_ms = Date.now();

export const saveBuffer = (room: Room, eid: number) => {
    // update position buffer
    const posBuffer = positionBufferByEid.get(eid);
    if (!posBuffer) return;

    posBuffer.push({
        x: Transform_Component.x[eid],
        y: Transform_Component.y[eid],
        clientTime_ms: clientTime_ms,
        serverTime_ms: room.state.serverTime_ms
    });
    Interpolate_Component.dt_ms[eid] = 0; // reset interpolation time
}

export const positionBufferByEid = new Map<number, IPosition[]>();

export const setLastPositionBufferByEid = (eid: number, x: number, y: number) => {
    const pb = positionBufferByEid.get(eid);
    if (pb) {
        const i = pb.length - 1;
        pb[i].x = x;
        pb[i].y = y;
    }
}

export const createInterpolate_System = () => {

    const onUpdate = defineQuery([Interpolate_Component]);
    const onAdd = enterQuery(onUpdate);

    const interpByEid = new Map<number, number>();

    const timer = new Timer();

    return defineSystem((world: IWorld) => {

        timer.tick();

        clientTime_ms += timer.dt_ms;

        onAdd(world).forEach(eid => {
            interpByEid.set(eid, 0);
            positionBufferByEid.set(eid, []);
        });

        onUpdate(world).forEach(eid => {
            // update interp
            Interpolate_Component.dt_ms[eid] += timer.dt_ms;

            // check if we are the player
            if (hasComponent(world, ClientPlayerInput_Component, eid)) {
                // do client side prediction simple interpolationa
                cspInterpolation(eid, positionBufferByEid.get(eid));
            } else {
                // do more complex interpolation
                generalInterpolation(eid, positionBufferByEid.get(eid));
            }
        })

        return world;
    })
}

const generalInterpolation = (eid: number, position_buffer: IPosition[] | undefined) => {
    if (!position_buffer) return;
    
    let meanClientServerDelta_ms = 0;
    position_buffer.forEach(pb => {
        meanClientServerDelta_ms += pb.clientTime_ms - pb.serverTime_ms;
    });
    meanClientServerDelta_ms /= position_buffer.length > 0 ? position_buffer.length : 1;
    const updateInterval_ms = 100;
    const lag_ms = ping / 2;

    const interpTime_ms = clientTime_ms - meanClientServerDelta_ms - updateInterval_ms - lag_ms;

    // find snapshots either side interp time
    let b = position_buffer.findIndex(pb => {
        return pb.serverTime_ms > interpTime_ms;
    });
    let a = b - 1;

    if (a >= 0) {
        const lerp = (interpTime_ms - position_buffer[a].serverTime_ms) / (position_buffer[b].serverTime_ms - position_buffer[a].serverTime_ms);
        Interpolate_Component.x[eid] = ArcUtils.Scalar.lerp(position_buffer[a].x, position_buffer[b].x, lerp);
        Interpolate_Component.y[eid] = ArcUtils.Scalar.lerp(position_buffer[a].y, position_buffer[b].y, lerp);
    }
}

const cspInterpolation = (eid: number, position_buffer: IPosition[] | undefined) => {
    if (!position_buffer) return;
    
    let length = position_buffer.length;
    let a = length-2;
    let b = length-1;

    if (length > 1) {
        const delta_ms = position_buffer[b].clientTime_ms - position_buffer[a].clientTime_ms;
        let interp = Interpolate_Component.dt_ms[eid] / delta_ms;

        interp = interp > 1 ? 1 : interp < 0 ? 0 : interp;

        Interpolate_Component.x[eid] = ArcUtils.Scalar.lerp(position_buffer[a].x, position_buffer[b].x, interp);
        Interpolate_Component.y[eid] = ArcUtils.Scalar.lerp(position_buffer[a].y, position_buffer[b].y, interp);
    
        while (position_buffer.length > 2) {
            position_buffer.shift();
        }
    }
}