import { Types, defineComponent } from "bitecs";


export const GA_PortalMageAxe = defineComponent({
    isActivated: Types.ui8,
    isRunning: Types.ui8,
    dx: Types.f32,
    dy: Types.f32
});