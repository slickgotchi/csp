// import { IWorld, addComponent, addEntity } from "bitecs"
// import { Transform } from "../../componets/Transform";
// import { Circle } from "../../componets/Circle";
// import { Color } from "../../componets/Color";
// import { Player } from "../../componets/Player";
// import { ServerMessage } from "../../componets/ServerMessage";
// import { Interpolate } from "../../componets/Interpolate";
// import { ClientPlayerInput } from "../../componets/ClientPlayerInput";
// import { Room } from "colyseus.js";
// import { IGameState } from "../../../../../server/src/types/IGameState";
// import { Schema } from '@colyseus/schema';
// import { Collider, ColliderShape } from "../../componets/collisions/Collider";
// import { ASC_Player } from "../../componets/gas/ability-system-components/ASC_Player";
// import { GA_Move } from "../../componets/gas/gameplay-abillities/GA_Move";


// interface iProps {
//     room: Room<IGameState & Schema>;
//     world: IWorld;
//     serverEid: number;
//     sessionId: string;
//     x: number;
//     y: number;
// }


// export const createPfPlayer = (props: iProps) => {
//     const eid = addEntity(props.world);

//     addComponent(props.world, ASC_Player, eid);

//     addComponent(props.world, Player, eid);
//     Player.speed[eid] = 400;

//     if (props.room.sessionId === props.sessionId) {
//         addComponent(props.world, ClientPlayerInput, eid);

//         addComponent(props.world, ServerMessage, eid);
//         ServerMessage.isServerReconciliation[eid] = 1;
//         ServerMessage.serverEid[eid] = props.serverEid;
//     } else {
//         addComponent(props.world, ServerMessage, eid);
//         ServerMessage.serverEid[eid] = props.serverEid;
//     }


//     addComponent(props.world, Transform, eid);
//     Transform.x[eid] = props.x;
//     Transform.y[eid] = props.y;

//     addComponent(props.world, Interpolate, eid);

//     addComponent(props.world, Circle, eid);
//     Circle.radius[eid] = 50;
    
//     addComponent(props.world, Color, eid);
//     Color.val[eid] = 0x66ff66;

//     addComponent(props.world, Collider, eid);
//     Collider.shape[eid] = ColliderShape.Circle;
//     Collider.radius[eid] = 50;
//     Collider.isAutoStaticSeparate[eid] = 1;

//     // add abilities
//     addComponent(props.world, GA_Move, eid);
// }