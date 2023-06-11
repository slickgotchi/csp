import { addGameObjectRoute } from "./AddGameObjectRoute";
import { serverUpdateRoute } from "./ServerUpdateRoute";

export const serverMessageRoutes = {
    'server-update': serverUpdateRoute,
    'add-game-object': addGameObjectRoute,
}