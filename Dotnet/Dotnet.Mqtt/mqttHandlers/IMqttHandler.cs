namespace Dotnet.Mqtt;

public interface IMqttHandler
{
    List<string> GetSubscriptions();
    void OnMessageReceive(string topic, object message);
}