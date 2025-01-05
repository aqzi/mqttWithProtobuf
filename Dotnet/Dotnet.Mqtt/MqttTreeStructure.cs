using System.Collections;

namespace Dotnet.Mqtt;

public class MqttTreeStructure(string topic) : IEnumerable<MqttTreeStructure>
{
    private readonly Dictionary<string, MqttTreeStructure> children = [];

    public readonly string Topic = topic;
    public List<IMqttHandler> Handlers = [];
    public MqttTreeStructure? Parent { get; set; }

    public MqttTreeStructure GetChild(string topic)
    {
        return children[topic];
    }

    public List<MqttTreeStructure> GetChildren()
    {
        return [.. children.Values];
    }

    public IEnumerator<MqttTreeStructure> GetEnumerator()
    {
        return children.Values.GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }

    public int Count
    {
        get { return children.Count; }
    }

    public void AddHandler(IMqttHandler handler)
    {
        Handlers.Add(handler);
    }

    public void RemoveHandler(IMqttHandler handler)
    {
        Handlers.Remove(handler);
    }

    public List<IMqttHandler> GetHandlers()
    {
        return Handlers;
    }

    public MqttTreeStructure GetRoot()
    {
        var root = this;
        var isRoot = false;

        while (!isRoot)
        {
            if (root.Parent != null)
            {
                root = root.Parent;
            }
            else
            {
                isRoot = true;
            }
        }

        return root;
    }

    //Return the tree node according to the topic. There is always 0 or 1 path.
    public MqttTreeStructure? GetTreeNode(string topic)
    {
        var root = GetRoot();

        //split topic
        var topics = topic.Split('/');

        if (topics.Length == 0)
        {
            return null;
        }

        //Move through the tree according to the topic and return the treeNode.
        var current = root;

        foreach (var t in topics)
        {
            if (current.children.ContainsKey(t))
            {
                current = current.GetChild(t);
            }
            else
            {
                return null;
            }
        }

        return current;
    }

    public void AddTreeNode(string topic, IMqttHandler? handler)
    {
        var topics = topic.Split('/');

        if (topics.Length == 0)
        {
            return;
        }

        var current = this;

        foreach (var t in topics)
        {
            if (current.children.ContainsKey(t))
            {
                current = current.GetChild(t);
            }
            else
            {
                var newNode = new MqttTreeStructure(t)
                {
                    Parent = current
                };
                
                current.children.Add(t, newNode);
                current = newNode;
            }
        }

        if (handler != null)
        {
            current.AddHandler(handler);
        }
    }

    //Return all handlers that are subscribed to the topic
    public List<IMqttHandler>? GetMqttHandlers(string topic)
    {
        MqttTreeStructure root = GetRoot();

        var topics = topic.Split('/');

        if (topics.Length == 0)
        {
            return null;
        }

        List<IMqttHandler> handlers = [];
        List<MqttTreeStructure> current = [root];

        foreach (var t in topics)
        {
            List<MqttTreeStructure> next = [];

            foreach (var c in current)
            {
                if (c.children.ContainsKey(t))
                {
                    next.Add(c.GetChild(t));
                }

                //skip 1 level
                if (c.children.ContainsKey("+"))
                {
                    next.Add(c.GetChild("+"));
                }

                //endpoint (you will never have ../#/... as topic)
                if (c.children.ContainsKey("#"))
                {
                    handlers.AddRange(c.GetChild("#").GetHandlers());
                }
            }

            current = next;
        }

        current.ForEach(c => handlers.AddRange(c.GetHandlers()));

        return handlers;
    }

    public IEnumerable<string> GetAllSubscriptions(MqttTreeStructure? node)
    {
        List<string> subscriptions = [];

        var treeNode = node ?? GetRoot();

        foreach (var child in treeNode.children)
        {
            //only add subscriptions that have handlers
            if(child.Value.Handlers.Count > 0)
            {
                subscriptions.Add(child.Key);
            }

            if (child.Value.Count > 0)
            {
                var childSubscriptions = child.Value.GetAllSubscriptions(child.Value);

                foreach (var childSubscription in childSubscriptions)
                {
                    subscriptions.Add(child.Key + "/" + childSubscription);
                }
            }
        }

        return subscriptions;
    }
}