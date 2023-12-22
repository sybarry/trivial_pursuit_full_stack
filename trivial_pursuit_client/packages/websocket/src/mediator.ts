import { UserDetails } from './data';
import { ServerProxy } from './server-proxy';

/**
 * This class interacts with an HTML page containing an input field of id 'user-id' and
 * a list of elements of id 'result'
 */
export class Mediator {
    static fieldId: string = 'user-id';
    static listId: string = 'result';

    private inputElement?: HTMLInputElement;
    private _server: ServerProxy;
    private outputList?: HTMLUListElement;

    constructor(server: ServerProxy) {
        this._server = server;
    }

    public get server() {
        return this._server;
    }

    public init(): void {
        console.log("Mediator::init()");
        this.inputElement = document.getElementById(Mediator.fieldId) as HTMLInputElement;
        this.inputElement.addEventListener('change', (evt: Event) => {
            this.changed(evt);
        });
        this.outputList = document.getElementById(Mediator.listId) as HTMLUListElement;
    }

    public addResult(value : string) {
        let item =  document.createElement('li');
        item.innerHTML = value;
        this.outputList!.appendChild(item);
    }

    /**
     *  Method called when the input field ('user-id') is modified
     */
    private changed(this : Mediator, event : Event): void {
        console.log("fieldChanged() called");
        let element: HTMLInputElement = event.target as HTMLInputElement;
        let id: number = parseInt(element.value);
        this._server.findUserById(id)
            .subscribe({
                onComplete: (payload) => {
                    console.log("COMPLETED");
                    const data = payload.data;
                    console.log(data.valueOf());
                    let user = new UserDetails(data.id, data.name, data.password);
                    this.addResult(user.toString())
                },
                onError: (err) => {
                    console.log("ERROR => " + err);
                    console.log("ERROR STACK: " + err.stack);
                },
                onSubscribe: (subscription) => {
                },
            });
    }
}