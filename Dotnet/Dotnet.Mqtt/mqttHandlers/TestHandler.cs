using Google.Protobuf;
using Proto = Dotnet.Protobuf;

namespace Dotnet.Mqtt.MqttHandlers;

public class TestHandler(IMqttService mqttService) : IMqttHandler
{
    private readonly IMqttService mqttService = mqttService;
    private readonly List<string> subscriptions =
    [
        "event/test/#",
    ];

    public List<string> GetSubscriptions()
    {
        return subscriptions;
    }

    public void OnMessageReceive(string topic, object message)
    {
        Console.WriteLine($"TestHandler received message on topic {topic}");

        switch(message)
        {
            case Proto.Test test:
                Proto.Test testMsg = new()
                {
                    Timestamp = test.Timestamp,
                    Msg = $"Echo through dotnet => {test.Msg}",
                };
                
                mqttService.Publish(MqttAction.EVENT, "testDotnet", "dotnet", "Test", testMsg.ToByteArray());

                break;
            case Proto.User user:
                Proto.User userMsg = new()
                {
                    Timestamp = user.Timestamp,
                    Name = $"{user.Name} [Dotnet]",
                    Age = user.Age,
                };
                
                mqttService.Publish(MqttAction.EVENT, "testDotnet", "dotnet", "User", userMsg.ToByteArray());

                break;
            default:
                Console.WriteLine("Unknown message received");
                break;
        }
    }
}