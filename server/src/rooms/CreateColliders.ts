import { Room } from "colyseus";
import { Schema } from '@colyseus/schema'
import { IGameState } from "../types/IGameState";
import * as Collisions from 'detect-collisions';
import { sPlayer } from "../types/sPlayer";
import { sRectangle } from "../types/sRectangle";


export const createColliders = (room: Room<IGameState & Schema>, system: Collisions.System) => {
    room.state.gameObjects.forEach(go => {
        switch (go.type) {
            case "player": {
                (go as sPlayer).collider = system.createCircle(
                    {x: go.position.x, y: go.position.y},
                    50
                )
                break;
            }
            case "rectangle": {
                (go as sRectangle).collider = system.createBox(
                    {x: go.position.x, y: go.position.y},
                    (go as sRectangle).width,
                    (go as sRectangle).height
                )
                break;
            }
            default: break;
        }
    })
}