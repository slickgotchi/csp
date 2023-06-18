import { Circle } from "detect-collisions";
import { sGameObject } from "./sGameObject";
import { type } from '@colyseus/schema';
import { IInputMessage } from "./Input";

interface IProps {
    serverEid: number;
    x: number;
    y: number;
    sessionId: string;
}


export class sPlayer extends sGameObject {

    // collider?: Circle;
    meanPing_ms: number = 500;

    inputMessages: IInputMessage[] = [];

    @type('string')
    sessionId: string = "";

    @type('number')
    last_processed_input = 0;

    constructor(props: IProps) {
        super();
        this.type = 'player';
        this.serverEid = props.serverEid;
        this.sessionId = props.sessionId;
        this.x = props.x;
        this.y = props.y;
    }
}