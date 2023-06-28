import GameRoom from "../../../../rooms/Game";
import { sPlayer } from "../../../../types/sPlayer";
import { Transform } from "../../../components/Transform";
import { GA_Dash } from "../../../components/gas/gameplay-abilities/GA_Dash";
import { GA_MeleeAttack } from "../../../components/gas/gameplay-abilities/GA_MeleeAttack";
import { GA_PortalMageAxe } from "../../../components/gas/gameplay-abilities/GA_PortalMageAxe";
import { GA_RangedAttack } from "../../../components/gas/gameplay-abilities/GA_RangedAttack";
import { collidersByEid, separateFromStaticColliders } from "../../collisions/ColliderSystem";


export const isActiveAbilities = (eid: number) => {
    return (
        GA_Dash.isRunning[eid] ||
        GA_MeleeAttack.isRunning[eid] ||
        GA_RangedAttack.isRunning[eid] ||
        GA_PortalMageAxe.isRunning[eid]
    )
}

export const movePlayer = (room: GameRoom, eid: number, dx: number, dy: number) => {
    Transform.x[eid] += dx;
    Transform.y[eid] += dy;
    (room.state.gameObjects.get(eid.toString()) as sPlayer).last_processed_input++;
    separateFromStaticColliders(eid, collidersByEid.get(eid));
}