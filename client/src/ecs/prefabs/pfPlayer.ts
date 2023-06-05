import { IWorld, addComponent, addEntity } from "bitecs"
import { Transform } from "../componets/Transform";
import { Circle } from "../componets/Circle";
import { Color } from "../componets/Color";
import { Player } from "../componets/Player";
import { ClientInput } from "../componets/ClientInput";


interface iProps {
    world: IWorld;
    x: number;
    y: number;
}


export const createPfPlayer = (props: iProps) => {
    const eid = addEntity(props.world);
    
    addComponent(props.world, Player, eid);
    Player.speed[eid] = 400;

    addComponent(props.world, ClientInput, eid);

    addComponent(props.world, Transform, eid);
    Transform.position.x[eid] = props.x;
    Transform.position.y[eid] = props.y;

    addComponent(props.world, Circle, eid);
    Circle.radius[eid] = 50;
    
    addComponent(props.world, Color, eid);
    Color.val[eid] = 0x66ff66;
}