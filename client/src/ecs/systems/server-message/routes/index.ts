import { addGameObjectRoute } from "./AddGameObjectRoute";
import { playerDashRoute } from "./PlayerDashRoute";
import { playerMeleeAttackRoute } from "./PlayerMeleeAttackRoute";
import { serverUpdateRoute } from "./ServerUpdateRoute";

export const serverMessageRoutes = {
    'server-update': serverUpdateRoute,
    'add-game-object': addGameObjectRoute,
    'player-dash': playerDashRoute,
    'player-melee-attack': playerMeleeAttackRoute
}