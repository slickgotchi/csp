import { GA_Dash } from "../../../components/gas/gameplay-abilities/GA_Dash";
import { GA_MeleeAttack } from "../../../components/gas/gameplay-abilities/GA_MeleeAttack";
import { GA_PortalMageAxe } from "../../../components/gas/gameplay-abilities/GA_PortalMageAxe";
import { GA_RangedAttack } from "../../../components/gas/gameplay-abilities/GA_RangedAttack";


export const isActiveAbilities = (eid: number) => {
    return (
        GA_Dash.isRunning[eid] ||
        GA_MeleeAttack.isRunning[eid] ||
        GA_RangedAttack.isRunning[eid] ||
        GA_PortalMageAxe.isRunning[eid]
    )
}