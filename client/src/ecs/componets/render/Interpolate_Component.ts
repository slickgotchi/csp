import { Types, defineComponent } from "bitecs";


export const Interpolate_Component = defineComponent({
    x: Types.f32,
    y: Types.f32,
    dt_ms: Types.f32    // the time elapsed since last buffer frame
});