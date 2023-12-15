"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreFacade = void 0;
const websocket_1 = require("@trivial-pursuit-client/websocket");
class CoreFacade {
    constructor() {
        this.server = new websocket_1.WebsocketServer();
    }
    connect(user, password) {
        console.log("Appel de CoreFacade::connect(" + user + ", " + password + ")");
        return this.server.connect(user, password);
    }
    disconnect() {
        console.log("Appel de CoreFacade::disconnect()");
        this.server.disconnect();
    }
}
exports.CoreFacade = CoreFacade;
//# sourceMappingURL=core-facade.js.map