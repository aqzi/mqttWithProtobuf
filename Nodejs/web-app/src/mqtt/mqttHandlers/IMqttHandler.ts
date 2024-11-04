export default interface IMqttHandler {
    getSubscriptions(): string[];
    onMessageReceive(topic: string, message: unknown): void;
}