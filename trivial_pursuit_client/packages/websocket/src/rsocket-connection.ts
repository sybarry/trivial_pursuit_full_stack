import { RSocketClient, ClientConfig, JsonSerializer, IdentitySerializer } from "rsocket-core";
import RSocketWebSocketClient from "rsocket-websocket-client";
import { ClientOptions } from "rsocket-websocket-client/RSocketWebSocketClient";


/**
 * Configures and creates an instance of RSocketClient
 *
 * @param url the Endpoint
 * @returns a new instance of RSocketClient
 */
export function createClient(url: string): RSocketClient<any, any> {
    const options: ClientOptions = {
        url: url,
        wsCreator: (url) => { return new WebSocket(url) }
    }
    const wsClient = new RSocketWebSocketClient(options);
    const config: ClientConfig<any, any> = {
        serializers: {
            data: JsonSerializer,
            metadata: IdentitySerializer
        },
        setup: {
            keepAlive: 60000,
            lifetime: 180000,
            dataMimeType: 'application/json',
            metadataMimeType: 'message/x.rsocket.routing.v0',
            payload: {
                data: 'one',
                metadata: String.fromCharCode('connect'.length) + 'connect'
            },
        },
        transport: wsClient
    }
    return new RSocketClient(config);
}