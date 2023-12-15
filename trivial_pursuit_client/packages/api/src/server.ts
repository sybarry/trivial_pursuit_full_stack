export interface TemplateServer {
    connect(user: String, password: String): boolean;
    disconnect(): void;
}