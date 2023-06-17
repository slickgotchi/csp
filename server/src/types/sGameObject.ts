import { Schema, type } from "@colyseus/schema";
import { sVector3 } from "./sVector3";


export class sGameObject extends Schema {
    @type('number')
    x = 0;
    @type('number')
    y = 0;
    @type('number')
    z = 0;

    @type('number')
    angle: number = 0;

    @type('number')
    serverEid: number = 0;

    @type('string')
    type: string = "base";

    // interpolation variables
    prevX: number = 0;
    prevY: number = 0;
    currX: number = 0;
    currY: number = 0;

    @type('number')
    interpX: number = 0;

    @type('number')
    interpY: number = 0;
    
    accum_ms: number = 0;

    constructor() {
        super()
    }
}