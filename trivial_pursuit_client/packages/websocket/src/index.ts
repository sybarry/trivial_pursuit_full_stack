import "@trivial-pursuit-client/api"
export * from './websocket-server';
// console.log("Salut de la part de Websocket !");

import { init } from "./rsocket-client";

console.log("Start");
const url = 'ws://localhost:6565/rsocket';
init(url);