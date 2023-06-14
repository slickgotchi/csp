import { IWorld, defineQuery, defineSystem } from "bitecs"
import GameRoom from "../../../../rooms/Game";
import { Client } from "colyseus";
import { sPlayer } from "../../../../types/sPlayer";
import { sGameObject } from "../../../../types/sGameObject";
import { Transform } from "../../../components/Transform";
import { IInput } from "../../../../types/Input";
import { GA_Movement } from "../../../components/gas/gameplay-abilities/GA_Movement";


export const createGA_ClientInputMovementSystem = (room: GameRoom) => {

    const onUpdate = defineQuery([GA_Movement]);

    // update code
    return defineSystem((world: IWorld) => {


        return world;
    })
}


