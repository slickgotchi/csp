import { Circle } from "detect-collisions";
import { sGameObject } from "./sGameObject";
import { type } from '@colyseus/schema';

interface IProps {
    x: number;
    y: number;
}


export class sPlayer extends sGameObject {

    collider?: Circle;

    constructor(props: IProps) {
        super();
        this.type = 'player';
        this.position.x = props.x;
        this.position.y = props.y;
    }
}