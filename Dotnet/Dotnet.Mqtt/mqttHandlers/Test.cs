using Google.Protobuf;
using Proto = Dotnet.Protobuf;

namespace Dotnet.Mqtt.MqttHandlers;

public class TestHandler(IMqttService mqttService) : IMqttHandler
{
    private readonly IMqttService mqttService = mqttService;
    private readonly List<string> subscriptions =
    [
        "state/test2/#",
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
            case Proto.Test.Test test:
                Console.WriteLine("Test1 received");

                //Echo message
                Proto.Test.Test msg = new()
                {
                    Msg = $"Echo: {test.Msg}",
                };

                Console.WriteLine("---------------- " + msg.GetType());
                
                mqttService.Publish(MqttAction.STATE, "testWorkerMsg", "worker", "Test.Test", msg.ToByteArray());

                break;
            default:
                Console.WriteLine("Unknown message received");
                break;
        }
    }
}