import { IParty, IUser } from "@trivial-pursuit-client/api/src";

export class Player{
    constructor(public mail: string, public password: string){}
}

export class User implements IUser{
    public username: string | undefined;
    public password: string | undefined;
}

export class Party implements IParty{
    public id!: number;
    public name!: string;
    public maxCapacityPlayer!: number;
}