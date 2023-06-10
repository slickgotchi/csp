import { IWorld, addComponent, addEntity } from "bitecs";
import { sPlayer } from "../../types/sPlayer";
import { MapSchema } from '@colyseus/schema';
import GameRoom from "../../rooms/Game";
import { Sync } from "../components/Sync";
import * as Collisions from 'detect-collisions';

interface IProps {
    room: GameRoom;
    world: IWorld;
    system: Collisions.System;
    sessionId: string;
    x: number;
    y: number;
}

export const createPfPlayer = (props: IProps) => {
    const eid = addEntity(props.world);

    // create the game object
    const playerGo = new sPlayer({
        serverEid: eid,
        sessionId: props.sessionId,
        x: props.x,
        y: props.y,
    });
    props.room.state.gameObjects.set(eid.toString(), playerGo);

    // add collider
    playerGo.collider = props.system.createCircle(
        {x: props.x, y: props.y },
        50
    );

    // add sync component
    addComponent(props.world, Sync, eid);

    return eid;
}