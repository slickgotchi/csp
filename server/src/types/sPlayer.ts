import { Circle } from "detect-collisions";
import { sGameObject } from "./sGameObject";
import { type } from '@colyseus/schema';
import { IMessage } from "../messages/Messages";

interface IProps {
    sessionId: string;
    x: number;
    y: number;
}


export class sPlayer extends sGameObject {

    collider?: Circle;

    messages: IMessage[] = [];

    @type('string')
    sessionId: string = "";

    @type('number')
    last_processed_input = 0;

    constructor(props: IProps) {
        super();
        this.type = 'player';
        this.sessionId = props.sessionId;
        this.pos.x = props.x;
        this.pos.y = props.y;
    }
}