import { Types, defineComponent } from "bitecs";


export const ServerMessage = defineComponent({
    isServerReconciliation: Types.ui8,
    serverEid: Types.ui32,
})