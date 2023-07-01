import { GA_Dash_Component } from "../../../componets/gas/gameplay-abillities/GA_Dash_Component"
import { GA_MeleeAttack_Component } from "../../../componets/gas/gameplay-abillities/GA_MeleeAttack_Component"
import { GA_PortalMageAxe_Component } from "../../../componets/gas/gameplay-abillities/GA_PortalMageAxe_Component"
import { GA_RangedAttack_Component } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack_Component"



export const isActiveAbilities = (eid: number) => {
    return (
        GA_Dash_Component.isRunning[eid] ||
        GA_MeleeAttack_Component.isRunning[eid] ||
        GA_RangedAttack_Component.isRunning[eid] ||
        GA_PortalMageAxe_Component.isRunning[eid]
    )
}