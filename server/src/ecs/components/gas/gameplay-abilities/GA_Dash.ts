import { Types, defineComponent } from "bitecs";


export const GA_Dash = defineComponent({
    tryActivate: Types.ui8,
    dx: Types.f32,
    dy: Types.f32,
    distance: Types.f32
});