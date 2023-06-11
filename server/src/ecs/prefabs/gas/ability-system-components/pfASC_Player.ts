import { IWorld, addComponent, addEntity } from "bitecs";
import { Room } from "colyseus";
import * as Collisions from 'detect-collisions';
import { sPlayer } from "../../../../types/sPlayer";
import { Sync } from "../../../components/Sync";
import { Transform } from "../../../components/Transform";
import { GA_Move } from "../../../components/gas/gameplay-abilities/GA_Move";


interface IProps {

}


interface IProps {
    room: Room;
    world: IWorld;
    system: Collisions.System;
    sessionId: string;
    x: number;
    y: number;
}

export const createPf_ASC_Player = (props: IProps) => {
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

    // transform
    addComponent(props.world, Transform, eid);
    Transform.x[eid] = props.x;
    Transform.y[eid] = props.y;

    // add gameplay abilities
    addComponent(props.world, GA_Move, eid);

    // add sync component
    addComponent(props.world, Sync, eid);

    return eid;
}