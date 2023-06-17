import { Types, defineComponent } from "bitecs";


export const GA_MeleeAttack = defineComponent({
    tryActivate: Types.ui8,
    dx: Types.f32,
    dy: Types.f32
});