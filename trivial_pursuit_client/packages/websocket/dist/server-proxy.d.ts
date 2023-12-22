import { Payload, ReactiveSocket } from 'rsocket-types';
import { Single } from "rsocket-flowable";
/**
 * This class receives local request and transfers them to the RSocketServer,
 * through the socket
 */
export declare class ServerProxy {
    private socket;
    constructor(socket: ReactiveSocket<any, any>);
    findUserById(id: number): Single<Payload<any, any>>;
}
//# sourceMappingURL=server-proxy.d.ts.map