namespace Dotnet.Mqtt;

public interface IMqttHandler
{
    List<string> GetSubscriptions();
    Task OnMessageReceive(string topic, object message);
}