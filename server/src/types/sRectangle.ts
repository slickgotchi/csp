import { Schema, type } from "@colyseus/schema";
import { sVector3 } from "./sVector3";


export class sRectangle extends Schema {
    @type(sVector3)
    position: sVector3 = new sVector3();

    @type('number')
    width: number = 100;

    @type('number')
    height: number = 100;

    constructor() {
        super();
        this.position.x = 1000;
        this.position.y = 500;
    }
}