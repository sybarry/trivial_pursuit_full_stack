"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@trivial-pursuit-client/core");
class WebClient {
    constructor() {
        this.facade = new core_1.CoreFacade();
    }
    main() {
        console.log("WebClient::main()");
        this.facade.connect("alice", "password");
    }
}
var client = new WebClient();
client.main();
//# sourceMappingURL=web-client.js.map