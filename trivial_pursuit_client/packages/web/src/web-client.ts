import {CoreFacade} from '@trivial-pursuit-client/core';

class WebClient {
    private facade: CoreFacade;

    public constructor() {
        this.facade = new CoreFacade();
    }

    public main(): void {
        console.log("WebClient::main()");
        this.facade.connect("alice", "password");
    }
}

var client = new WebClient();
client.main();