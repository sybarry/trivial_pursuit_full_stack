export class UserDetails {
    id : number;
    name : string;
    password : string;

    constructor(id : number, name: string,password : string) {
        this.id = id;
        this.name = name;
        this.password = password;
    }
    toString():string {
        return `User id: ${this.id} name: ${this.name} password: ${this.password}`
    }
}