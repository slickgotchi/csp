import { IWorld, addComponent, addEntity } from "bitecs";
import { sPlayer } from "../../types/sPlayer";
import { MapSchema } from '@colyseus/schema';
import GameRoom from "../../rooms/Game";
import { Sync } from "../components/Sync";
import * as Collisions from 'detect-collisions';
import { sEnemy } from "../../types/sEnemy";

interface IProps {
    room: GameRoom;
    world: IWorld;
    system: Collisions.System;
    x: number;
    y: number;
}

export const createPfEnemy = (props: IProps) => {
    const eid = addEntity(props.world);

    // create the game object
    const enemyGo = new sEnemy({
        serverEid: eid,
        x: props.x,
        y: props.y,
    });
    props.room.state.gameObjects.set(eid.toString(), enemyGo);

    // add collider
    enemyGo.collider = props.system.createCircle(
        {x: props.x, y: props.y },
        50
    );

    // add sync component
    addComponent(props.world, Sync, eid);

    return eid;
}