import { Types, defineComponent } from "bitecs";


export const AT_Move = defineComponent({
    dx: Types.f32,
    dy: Types.f32,
    dz: Types.f32,
    duration_ms: Types.f32,
    timer_ms: Types.f32,
});