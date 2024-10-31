namespace Dotnet.Mqtt;

public interface IMqttHandler
{
    List<string> Subscribe();
    void OnMessageReceive(string topic, object message);
}