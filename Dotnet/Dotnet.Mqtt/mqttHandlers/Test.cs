using Google.Protobuf;
using Proto = Dotnet.Protobuf;

namespace Dotnet.Mqtt.MqttHandlers;

public class TestHandler : IMqttHandler
{
    private readonly IMqttService mqttService;
    private readonly List<string> subscriptions = new()
    {
        "state/test2/#",
    };

    public TestHandler(IMqttService mqttService)
    {
        this.mqttService = mqttService;
    }

    public List<string> Subscribe()
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
                    Msg = test.Msg
                };

                Console.WriteLine("---------------- " + msg.GetType());
                
                mqttService.Send(MqttAction.STATE, "testServerMsg", "server", "Test.Test", msg.ToByteArray());

                break;
            default:
                Console.WriteLine("Unknown message received");
                break;
        }
    }
}