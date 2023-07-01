import { Types, defineComponent } from "bitecs";


export const ServerMessage_Component = defineComponent({
    isServerReconciliation: Types.ui8,
    serverEid: Types.ui32,
})