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
                Proto.Test msg = new()
                {
                    Timestamp = test.Timestamp,
                    Msg = $"Echo through worker => {test.Msg}",
                };
                
                mqttService.Publish(MqttAction.EVENT, "testWorker", "worker", "Test", msg.ToByteArray());

                break;
            default:
                Console.WriteLine("Unknown message received");
                break;
        }
    }
}