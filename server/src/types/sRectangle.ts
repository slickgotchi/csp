import { Schema, type } from "@colyseus/schema";
import { sVector3 } from "./sVector3";
import { sGameObject } from "./sGameObject";
import { Box } from "detect-collisions";

interface IProps {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class sRectangle extends sGameObject {
    @type('number')
    width: number = 100;

    @type('number')
    height: number = 100;

    collider?: Box;

    constructor(props: IProps) {
        super();
        this.type = "rectangle";
        this.pos.x = props.x;
        this.pos.y = props.y;
        this.width = props.width;
        this.height = props.height;
    }
}