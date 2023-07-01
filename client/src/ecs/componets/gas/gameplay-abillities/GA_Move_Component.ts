import { Types, defineComponent } from "bitecs";


export const GA_Move_Component = defineComponent({
    isActivated: Types.ui8,
    dx: Types.f32,
    dy: Types.f32
});