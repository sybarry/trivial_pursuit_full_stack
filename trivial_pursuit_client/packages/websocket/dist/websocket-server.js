"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketServer = void 0;
class WebsocketServer {
    connect(user, password) {
        console.log("Appel de WebsocketServer::connect(" + user + ", " + password + ")");
        return true;
    }
    disconnect() {
        console.log("Appel de disconnect()");
    }
}
exports.WebsocketServer = WebsocketServer;
//# sourceMappingURL=websocket-server.js.map