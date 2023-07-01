import { Types, defineComponent } from "bitecs";


export const Transform_Component = defineComponent({
    // position
    x: Types.f32,
    y: Types.f32,
    z: Types.f32,

    // scale
    sx: Types.f32,
    sy: Types.f32,

    // angle
    angle: Types.f32,
});