import { addGameObjectRoute } from "./AddGameObjectRoute";
import { playerDashRoute } from "./PlayerDashRoute";
import { serverUpdateRoute } from "./ServerUpdateRoute";

export const serverMessageRoutes = {
    'server-update': serverUpdateRoute,
    'add-game-object': addGameObjectRoute,
    'player-dash': playerDashRoute
}