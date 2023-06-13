import { Client } from "colyseus";

const tryActivateGA_strings = [
    "GA_Idol",
    "GA_Move",
    "etc. etc."
];

export interface IInput {
    tryActivateGA: string,
    move: {
        dx: number,
        dy: number,
    },
    key_release: {
        l: boolean,
        j: boolean
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