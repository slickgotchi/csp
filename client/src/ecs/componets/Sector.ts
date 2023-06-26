import { Types, defineComponent } from "bitecs";


export const Sector = defineComponent({
    radius: Types.f32,
    spreadDegrees: Types.f32,  // the spread angle this sector takes up
    angle: Types.f32,   // current rotation (in degrees) of the sector
    alpha: Types.f32,
    visible: Types.ui8,
})