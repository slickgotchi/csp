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

    constructor() {
        super();
    }
}