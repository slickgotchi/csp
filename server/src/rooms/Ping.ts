import { Client, Room } from "colyseus";
import { ASC_Player } from "../ecs/components/gas/ability-system-components/ASC_Player";
import { IWorld, defineQuery } from "bitecs";
import { sPlayer } from "../types/sPlayer";
import { clientPingBufferByEid_ms } from "./Game";

const onPlayers = defineQuery([ASC_Player]);

export const getEidFromClient = (client: Client, world: IWorld, room: Room) => {
    let retEid = 0;
    onPlayers(world).forEach(eid => {
        const go = room.state.gameObjects.get(eid.toString()) as sPlayer;
        if (go.sessionId === client.sessionId) {
            retEid = eid;
        }
    });
    return retEid;
}

export const setupPingSystem = (room: Room, world: IWorld) => {
    room.onMessage('ping-server', (client: Client, client_time_ms: number) => {
        client.send('server-ping', client_time_ms);
        
    })

    room.onMessage('client-ping', (client: Client, server_time_ms: number) => {
        const eid = getEidFromClient(client, world, room);
        const go = room.state.gameObjects.get(eid.toString()) as sPlayer;
        if (eid && go) {
            const ping = Number(Date.now()) - Number(server_time_ms);
            const pingBuffer = clientPingBufferByEid_ms.get(eid);
            if (pingBuffer) {
                pingBuffer.push(ping);
                if (pingBuffer.length > 10) {
                    pingBuffer.shift();
                }
                if (pingBuffer.length >= 1) {
                    let sum = 0;
                    pingBuffer.forEach(pb => {
                        sum += pb;
                    });
                    go.meanPing_ms = sum / pingBuffer.length;
                }
            }
            client.send('ping-client', room.state.serverTime_ms);
        }
    })
}