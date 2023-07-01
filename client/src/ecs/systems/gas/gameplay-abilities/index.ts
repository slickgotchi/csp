import { GA_Dash_Component } from "../../../componets/gas/gameplay-abillities/GA_Dash_Component"
import { GA_MeleeAttack_Component } from "../../../componets/gas/gameplay-abillities/GA_MeleeAttack_Component"
import { GA_PortalMageAxe_Component } from "../../../componets/gas/gameplay-abillities/GA_PortalMageAxe_Component"
import { GA_RangedAttack_Component } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack_Component"
import { 
    tryActivateGA_Dash, 
    tryActivateGA_MeleeAttack,
    tryActivateGA_Move,
    tryActivateGA_Null,
    tryActivateGA_PortalMageAxe,
    tryActivateGA_RangedAttack,
} from "../../../../internalExports";

export const isActiveAbilities = (eid: number) => {
    return (
        GA_Dash_Component.isRunning[eid] ||
        GA_MeleeAttack_Component.isRunning[eid] ||
        GA_RangedAttack_Component.isRunning[eid] ||
        GA_PortalMageAxe_Component.isRunning[eid]
    )
}

// export const tryActivateGA_Routes = {
//     "GA_Null": tryActivateGA_Null,
//     'GA_Move': tryActivateGA_Move,
//     "GA_Dash": tryActivateGA_Dash,
//     "GA_MeleeAttack": tryActivateGA_MeleeAttack,
//     "GA_RangedAttack": tryActivateGA_RangedAttack,
//     "GA_PortalMageAxe": tryActivateGA_PortalMageAxe
// }
