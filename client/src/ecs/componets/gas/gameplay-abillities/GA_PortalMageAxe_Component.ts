import { Types, defineComponent } from "bitecs";


export const GA_PortalMageAxe_Component = defineComponent({
    isActivated: Types.ui8,
    isRunning: Types.ui8,
    dir: {
        x: Types.f32,
        y: Types.f32
    }
});