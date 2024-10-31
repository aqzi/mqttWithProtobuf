using System.Collections.Concurrent;
using System.Reflection;
using Dotnet.Mqtt.Utils;
using Google.Protobuf;

namespace Dotnet.Mqtt;

public interface IMqttRegistry
{
    bool TryGetParser(string typeName, out MessageParser? parser);
    bool TryGetHandlers(string topic, out List<IMqttHandler>? handlersValue);
    List<string> GetAllSubscriptions();
}

public class MqttRegistry : IMqttRegistry
{
    private readonly ConcurrentDictionary<string, MessageParser> parsers = new(); //key: namespace.msgType
    //remark: a dict is a temporarly solution. A search tree would be a better choice for high performance!
    private readonly TreeNode handlers = new("root");
    
    public MqttRegistry(Assembly? assembly, IMqttService mqttservice)
    {
        CacheParsers();
        CacheHandlers(assembly, mqttservice);

        handlers.AddTreeNode("state", null);
        handlers.AddTreeNode("command", null);
        handlers.AddTreeNode("event", null);
    }

    private void CacheParsers()
    {
        var messagesAssembly = Assembly.GetAssembly(typeof(Protobuf.Test.Test));

        if (messagesAssembly != null)
        {
            var messageTypes = messagesAssembly.GetTypes().Where(t => t.FullName != null && t.FullName.StartsWith($"Dotnet.Protobuf.")).ToList();

            foreach (var type in messageTypes)
            {
                var prop = type.GetProperty("Parser");

                if (prop != null)
                {
                    if (prop.GetValue(null, null) is MessageParser parser && type.FullName != null)
                    {
                        parsers.TryAdd(type.FullName.Replace("Dotnet.Protobuf.", ""), parser);
                    }
                }
            }
        }
    }

    private void CacheHandlers(Assembly? messagesAssembly, IMqttService mqttService)
    {
        if (messagesAssembly != null)
        {
            var handlerTypes = messagesAssembly.GetTypes().Where(t => t.IsClass && !t.IsAbstract && t.GetInterfaces().Contains(typeof(IMqttHandler))).ToList();

            foreach (var type in handlerTypes)
            {
                // Check if the type has a constructor that accepts IMqttService
                var constructor = type.GetConstructor(new[] { typeof(IMqttService) });

                IMqttHandler handler;

                if (constructor != null) handler = (IMqttHandler)Activator.CreateInstance(type, mqttService)!;
                else handler = (IMqttHandler)Activator.CreateInstance(type)!;

                var topics = handler.Subscribe();

                //store the handler with corresponding topic in the tree structure
                foreach (var topic in topics)
                {
                    handlers.AddTreeNode(topic, handler);
                }
            }
        }
    }

    public bool TryGetParser(string typeName, out MessageParser? parser)
    {
        return parsers.TryGetValue(typeName, out parser);
    }

    public bool TryGetHandlers(string topic, out List<IMqttHandler>? handlersValue)
    {
        var tmp = handlers.GetMqttHandlers(topic);
        handlersValue = tmp;

        return tmp != null;
    }

    public List<string> GetAllSubscriptions()
    {
        return handlers.GetAllSubscriptions(null);
    }
}