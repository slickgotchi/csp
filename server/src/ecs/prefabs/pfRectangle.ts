import { IWorld, addComponent, addEntity } from "bitecs";
import { sPlayer } from "../../types/sPlayer";
import { MapSchema } from '@colyseus/schema';
import GameRoom from "../../rooms/Game";
import { Sync } from "../components/Sync";
import { sRectangle } from "../../types/sRectangle";
import * as Collisions from 'detect-collisions';

interface IProps {
    room: GameRoom;
    world: IWorld;
    system: Collisions.System;
    x: number;
    y: number;
    width: number;
    height: number;
}

export const createPfRectangle = (props: IProps) => {
    const eid = addEntity(props.world);

    // create the game object
    const rectGo = new sRectangle({
        serverEid: eid,
        x: props.x,
        y: props.y,
        width: props.width,
        height: props.height
    });
    props.room.state.gameObjects.set(eid.toString(), rectGo);

    // add collider
    rectGo.collider = props.system.createBox(
        {x: props.x, y: props.y},
        props.width,
        props.height,
        {isStatic: true}
    )

    // add sync component
    addComponent(props.world, Sync, eid);

    return eid;
}