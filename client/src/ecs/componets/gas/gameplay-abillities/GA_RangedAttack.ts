import { Types, defineComponent } from "bitecs";


export const GA_RangedAttack = defineComponent({
    activated: Types.ui8,
    running: Types.ui8,
    dx: Types.f32,
    dy: Types.f32
});