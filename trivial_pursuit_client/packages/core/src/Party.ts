import { IParty } from "@trivial-pursuit-client/api/src/server";

export class Party implements IParty {
    public id!: number;
    public name!: string;
    public maxCapacityPlayer!: number;
}