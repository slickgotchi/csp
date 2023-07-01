import { Types, defineComponent } from "bitecs";


export const GA_RangedAttack_Component = defineComponent({
    isActivated: Types.ui8,
    isRunning: Types.ui8,
    dx: Types.f32,
    dy: Types.f32
});