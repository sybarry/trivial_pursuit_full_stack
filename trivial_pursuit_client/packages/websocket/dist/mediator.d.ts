import { ServerProxy } from './server-proxy';
/**
 * This class interacts with an HTML page containing an input field of id 'user-id' and
 * a list of elements of id 'result'
 */
export declare class Mediator {
    static fieldId: string;
    static listId: string;
    private inputElement?;
    private _server;
    private outputList?;
    constructor(server: ServerProxy);
    get server(): ServerProxy;
    init(): void;
    addResult(value: string): void;
    /**
     *  Method called when the input field ('user-id') is modified
     */
    private changed;
}
//# sourceMappingURL=mediator.d.ts.map