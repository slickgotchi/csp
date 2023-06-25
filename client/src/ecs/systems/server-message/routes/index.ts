import { IWorld, defineQuery } from "bitecs";
import { addGameObjectRoute } from "./AddGameObjectRoute";
import { enemyTakeDamageRoute } from "./EnemyTakeDamageRoute";
import { playerDashRoute } from "./PlayerDashRoute";
import { playerMeleeAttackRoute } from "./PlayerMeleeAttackRoute";
import { playerMoveRoute } from "./PlayerMoveRoute";
import { playerRangedAttackRoute } from "./PlayerRangedAttackRoute";
import { serverUpdateRoute } from "./ServerUpdateRoute";
import { Player } from "../../../componets/Player";
import { Enemy } from "../../../componets/Enemy";
import { ServerMessage } from "../../../componets/ServerMessage";
import { playerPortalMageAxeRoute } from "./PlayerPortalMageAxeRoute";

export const serverMessageRoutes = {
    'server-update': serverUpdateRoute,
    'add-game-object': addGameObjectRoute,
    'player-move': playerMoveRoute,
    'player-dash': playerDashRoute,
    'player-melee-attack': playerMeleeAttackRoute,
    'player-ranged-attack': playerRangedAttackRoute,
    "player-portal-mage-axe": playerPortalMageAxeRoute,
    'enemy-take-damage': enemyTakeDamageRoute
}


const onPlayers = defineQuery([Player]);
const onEnemies = defineQuery([Enemy]);

export const getEidFromServerEid = (world: IWorld, serverEid: number) => {
    // check players
    const players = onPlayers(world);
    for (let i = 0; i < players.length; i++) {
        if (ServerMessage.serverEid[players[i]] === serverEid) {
            return players[i];
        }
    }

    // check enemies
    const enemies = onEnemies(world);
    for (let i = 0; i < enemies.length; i++) {
        if (ServerMessage.serverEid[enemies[i]] === serverEid) {
            return enemies[i];
        }
    }

    // no match, return undefined
    return undefined;
}