import { GA_Dash } from "../../../componets/gas/gameplay-abillities/GA_Dash"
import { GA_MeleeAttack } from "../../../componets/gas/gameplay-abillities/GA_MeleeAttack"
import { GA_PortalMageAxe } from "../../../componets/gas/gameplay-abillities/GA_PortalMageAxe"
import { GA_RangedAttack } from "../../../componets/gas/gameplay-abillities/GA_RangedAttack"


export const isActiveAbilities = (eid: number) => {
    return (
        GA_Dash.isRunning[eid] ||
        GA_MeleeAttack.isRunning[eid] ||
        GA_RangedAttack.isRunning[eid] ||
        GA_PortalMageAxe.isRunning[eid]
    )
}