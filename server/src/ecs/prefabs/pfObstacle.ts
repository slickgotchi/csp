import { IWorld, addComponent, addEntity } from "bitecs";
import { sPlayer } from "../../types/sPlayer";
import { MapSchema } from '@colyseus/schema';
import GameRoom from "../../rooms/Game";
import { Sync } from "../components/Sync";
import { sRectangle } from "../../types/sRectangle";
import * as Collisions from 'detect-collisions';
import { Collider, ColliderShape } from "../components/collisions/Collider";
import { Transform } from "../components/Transform";

interface IProps {
    room: GameRoom;
    world: IWorld;
    system: Collisions.System;
    x: number;
    y: number;
    width: number;
    height: number;
}

export const createPfObstacle = (props: IProps) => {
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

    addComponent(props.world, Transform, eid);
    Transform.x[eid] = props.x;
    Transform.y[eid] = props.y;

    addComponent(props.world, Collider, eid);
    Collider.shape[eid] = ColliderShape.Box;
    Collider.width[eid] = props.width;
    Collider.height[eid] = props.height;
    Collider.isStatic[eid] = 1;

    // add sync component
    addComponent(props.world, Sync, eid);

    return eid;
}