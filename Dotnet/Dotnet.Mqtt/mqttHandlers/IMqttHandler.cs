namespace Dotnet.Mqtt;

public interface IMqttHandler
{
    IEnumerable<string> Subscriptions { get; }
    Task OnMessageReceive(string topic, object message);
}