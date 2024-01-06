export interface TrivialPursuitServer {
    connect(user: String, password: String): boolean;
    disconnect(): void;
}