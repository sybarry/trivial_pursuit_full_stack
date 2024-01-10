import { TrivialPursuitServer } from "@trivial-pursuit-client/api";

export class WebsocketServer implements TrivialPursuitServer {
    connect(user: String, password: String): boolean {
        console.log("Appel de WebsocketServer::connect(" + user + ", " + password + ")");
        return true;
    }
    disconnect(): void {
        console.log("Appel de disconnect()");
    }
}