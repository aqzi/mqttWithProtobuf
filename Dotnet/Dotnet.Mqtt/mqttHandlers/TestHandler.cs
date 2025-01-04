using Google.Protobuf;
using Proto = Dotnet.Protobuf.Test;

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
                
                mqttService.Publish(MqttAction.EVENT, "testDotnet", "dotnet", "Test", "Test", testMsg.ToByteArray());

                break;
            case Proto.User user:
                Proto.User userMsg = new()
                {
                    Timestamp = user.Timestamp,
                    Name = $"{user.Name} [Dotnet]",
                    Age = user.Age,
                };
                
                mqttService.Publish(MqttAction.EVENT, "testDotnet", "dotnet", "Test", "User", userMsg.ToByteArray());

                break;
            case Proto.TestWithAnimal animal:
                Proto.TestWithAnimal animalMsg = new()
                {
                    Timestamp = animal.Timestamp,
                    IsResponse = true,
                    Animal = animal.Animal,
                };
                
                mqttService.Publish(MqttAction.EVENT, "testDotnet", "dotnet", "Test", "TestWithAnimal", animalMsg.ToByteArray());

                break;
            default:
                Console.WriteLine("Unknown message received");
                break;
        }
    }
}