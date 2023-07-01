import { IWorld, defineQuery } from "bitecs";
import { addGameObjectRoute } from "./AddGameObjectRoute";
import { enemyTakeDamageRoute } from "./EnemyTakeDamageRoute";
import { playerDashRoute } from "./PlayerDashRoute";
import { playerMeleeAttackRoute } from "./PlayerMeleeAttackRoute";
import { playerMoveRoute } from "./PlayerMoveRoute";
import { playerRangedAttackRoute } from "./PlayerRangedAttackRoute";
import { serverUpdateRoute } from "./ServerUpdateRoute";
import { playerPortalMageAxeRoute } from "./PlayerPortalMageAxeRoute";
import { ASC_Player_Component } from "../../../componets/gas/ability-system-components/ASC_Player_Component";
import { ASC_Enemy_Component } from "../../../componets/gas/ability-system-components/ASC_Enemy_Component";
import { ServerMessage_Component } from "../../../componets/network/ServerMessage_Component";

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


const onPlayers = defineQuery([ASC_Player_Component]);
const onEnemies = defineQuery([ASC_Enemy_Component]);

export const getEidFromServerEid = (world: IWorld, serverEid: number) => {
    // check players
    const players = onPlayers(world);
    for (let i = 0; i < players.length; i++) {
        if (ServerMessage_Component.serverEid[players[i]] === serverEid) {
            return players[i];
        }
    }

    // check enemies
    const enemies = onEnemies(world);
    for (let i = 0; i < enemies.length; i++) {
        if (ServerMessage_Component.serverEid[enemies[i]] === serverEid) {
            return enemies[i];
        }
    }

    // no match, return undefined
    return undefined;
}