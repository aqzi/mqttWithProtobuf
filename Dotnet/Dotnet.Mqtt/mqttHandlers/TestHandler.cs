using Google.Protobuf;
using Proto = Dotnet.Protobuf.Test;

namespace Dotnet.Mqtt.MqttHandlers;

public class TestHandler(IMqttService mqttService) : IMqttHandler
{
    private readonly IMqttService mqttService = mqttService;
    public IEnumerable<string> Subscriptions { get; } =
    [
        "event/test/#",
    ];

    public async Task OnMessageReceive(string topic, object message)
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
                
                await mqttService.Publish(MqttAction.EVENT, "testDotnet", "dotnet", "Test", "Test", testMsg.ToByteArray());

                break;
            case Proto.User user:
                Proto.User userMsg = new()
                {
                    Timestamp = user.Timestamp,
                    Name = $"{user.Name} [Dotnet]",
                    Age = user.Age,
                };
                
                await mqttService.Publish(MqttAction.EVENT, "testDotnet", "dotnet", "Test", "User", userMsg.ToByteArray());

                break;
            case Proto.TestWithAnimal animal:
                Proto.TestWithAnimal animalMsg = new()
                {
                    Timestamp = animal.Timestamp,
                    IsResponse = true,
                    Animal = animal.Animal,
                };
                
                await mqttService.Publish(MqttAction.EVENT, "testDotnet", "dotnet", "Test", "TestWithAnimal", animalMsg.ToByteArray());

                break;
            default:
                Console.WriteLine("Unknown message received");
                break;
        }
    }
}