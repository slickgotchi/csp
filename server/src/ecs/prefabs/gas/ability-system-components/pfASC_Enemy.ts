import { IWorld, addComponent, addEntity } from "bitecs";
import * as Collisions from 'detect-collisions';
import GameRoom from "../../../../rooms/Game";
import { sEnemy } from "../../../../types/sEnemy";
import { ASC_Enemy } from "../../../components/gas/ability-system-components/ASC_Enemy";
import { Transform } from "../../../components/Transform";
import { Collider, ColliderShape } from "../../../components/collisions/Collider";
import { Sync } from "../../../components/Sync";

interface IProps {
    room: GameRoom;
    world: IWorld;
    system: Collisions.System;
    x: number;
    y: number;
}

export const createPfASC_Enemy = (props: IProps) => {
    const eid = addEntity(props.world);

    // create the game object
    const enemyGo = new sEnemy({
        serverEid: eid,
        x: props.x,
        y: props.y,
    });
    props.room.state.gameObjects.set(eid.toString(), enemyGo);

    // add asc enemy component
    addComponent(props.world, ASC_Enemy, eid);

    // transform
    addComponent(props.world, Transform, eid);
    Transform.x[eid] = props.x;
    Transform.y[eid] = props.y;

    // collider
    addComponent(props.world, Collider, eid);
    Collider.shape[eid] = ColliderShape.Circle;
    Collider.radius[eid] = 40;
    Collider.isAutoStaticSeparate[eid] = 1;

    // add sync component
    addComponent(props.world, Sync, eid);

    return eid;
}