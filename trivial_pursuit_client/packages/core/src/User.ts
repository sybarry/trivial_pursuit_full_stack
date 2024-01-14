import { IUser } from "@trivial-pursuit-client/api/src/server";

export class User implements IUser {
    public username: string | undefined;
    public password: string | undefined;
}