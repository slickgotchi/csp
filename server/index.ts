import http from 'http';
import express from 'express';
import cors from 'cors';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

import { Server } from 'colyseus';
import GameRoom from './src/rooms/Game';

const port = Number(process.env.PORT || 8888);
const app = express();

app.use('/', (req: any, res: any, next: any) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

const server = http.createServer(app);
const gameServer = new Server({
    server
});

gameServer.define('game', GameRoom);

gameServer.simulateLatency(200);

gameServer.listen(port);

console.log(`Listening on port:${port}`);