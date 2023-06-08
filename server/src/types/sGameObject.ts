import { Schema, type } from "@colyseus/schema";
import { sVector3 } from "./sVector3";


export class sGameObject extends Schema {
    @type(sVector3)
    position: sVector3 = new sVector3();

    @type('number')
    angle: number = 0;

    @type('number')
    serverEid: number = 0;

    @type('string')
    type: string = "base";

    constructor() {
        super();
        this.position.x = 1000;
        this.position.y = 500;
    }
}