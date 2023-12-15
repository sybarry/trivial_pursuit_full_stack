import { TemplateServer } from "@trivial-pursuit-client/api";
import { WebsocketServer } from "@trivial-pursuit-client/websocket";

export class CoreFacade {
    private server: TemplateServer;

    constructor() {
        this.server = new WebsocketServer();
    }

    public connect(user: String, password: String): boolean {
        console.log("Appel de CoreFacade::connect(" + user + ", " + password + ")");
        return this.server.connect(user, password);
    }

    public disconnect(): void {
        console.log("Appel de CoreFacade::disconnect()");
        this.server.disconnect();
    }
}