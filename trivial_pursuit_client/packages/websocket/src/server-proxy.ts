import { Payload, ReactiveSocket } from 'rsocket-types';
import { Single } from "rsocket-flowable";

/**
 * This class receives local request and transfers them to the RSocketServer,
 * through the socket
 */
export class ServerProxy {
    private socket: ReactiveSocket<any, any>;

    constructor(socket: ReactiveSocket<any, any>) {
        this.socket = socket;
    }

    public findUserById(id: number): Single<Payload<any, any>> {
        console.log("finUserId() called");
        return this.socket.requestResponse({
            data: id,
            metadata: String.fromCharCode('user'.length) + 'user'
        })
    }
}