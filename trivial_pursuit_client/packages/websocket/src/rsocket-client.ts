import { RSocketClient } from 'rsocket-core';
import { createClient } from './rsocket-connection';
import { Mediator } from './mediator';
import { ServerProxy } from './server-proxy';

/**
 * Connects the RSocketClient to server.
 *
 * @param url
 */
export function init(url: string): void {
    let client: RSocketClient<any, any> = createClient(url);
    client.connect().subscribe({
        onComplete: socket => {
            console.log("onComplete");
            let mediator = new Mediator(new ServerProxy(socket));
            mediator.init();
        },
        onError: error => {
            console.log("onError");
            console.error(error);
        },
        onSubscribe: (cancel) => {
            console.log("onSubscribe");
        }
    });
}