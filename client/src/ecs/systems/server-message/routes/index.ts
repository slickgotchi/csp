import { addGameObjectRoute } from "./AddGameObjectRoute";
import { enemyTakeDamageRoute } from "./EnemyTakeDamageRoute";
import { playerDashRoute } from "./PlayerDashRoute";
import { playerMeleeAttackRoute } from "./PlayerMeleeAttackRoute";
import { playerRangedAttackRoute } from "./PlayerRangedAttackRoute";
import { serverUpdateRoute } from "./ServerUpdateRoute";

export const serverMessageRoutes = {
    'server-update': serverUpdateRoute,
    'add-game-object': addGameObjectRoute,
    'player-dash': playerDashRoute,
    'player-melee-attack': playerMeleeAttackRoute,
    'player-ranged-attack': playerRangedAttackRoute,
    'enemy-take-damage': enemyTakeDamageRoute
}