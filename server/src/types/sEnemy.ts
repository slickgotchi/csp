import { Circle } from "detect-collisions";
import { sGameObject } from "./sGameObject";
import { type } from '@colyseus/schema';
import { IMessage } from "../messages/Messages";

interface IProps {
    serverEid: number;
    x: number;
    y: number;
}

export let nextEnemyId = 1;

export class sEnemy extends sGameObject {

    collider?: Circle;
    dx = 0;
    dy = 0;
    timer_ms = Math.random()*3000;
    id = nextEnemyId++;

    constructor(props: IProps) {
        super();
        this.type = 'enemy';
        this.serverEid = props.serverEid;
        this.x = props.x;
        this.y = props.y;
    }
}