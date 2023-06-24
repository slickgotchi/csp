import { Client } from "colyseus";

const tryActivateGA_strings = [
    "GA_Idol",
    "GA_Move",
    "etc. etc."
];

export interface IInput {
    targetGA: string,
    dir: {
        x: number,
        y: number,
    },
    key_release: {
        l: boolean,
        j: boolean,
        k: boolean,
    },
    dt_ms: number,
    id: number,
}

export interface IInputMessage {
    client: Client;
    name: string;
    input: IInput;
    recv_ms: number;
}