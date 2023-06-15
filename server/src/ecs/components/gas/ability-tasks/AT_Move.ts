import { Types, defineComponent } from "bitecs";


export const AT_Move = defineComponent({
    vx: Types.f32,
    vy: Types.f32,
    vz: Types.f32,
    duration_ms: Types.f32,
    timer_ms: Types.f32,
});