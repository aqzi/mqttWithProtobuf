using System.Collections;

namespace Dotnet.Mqtt.Utils;

public class TreeNode : IEnumerable<TreeNode>
{
    private readonly Dictionary<string, TreeNode> children = new();

    public readonly string Topic;
    public List<IMqttHandler> Handlers = new();
    public TreeNode? Parent { get; set; }

    public TreeNode(string topic)
    {
        this.Topic = topic;
    }

    public TreeNode GetChild(string topic)
    {
        return children[topic];
    }

    public List<TreeNode> GetChildren()
    {
        return children.Values.ToList();
    }

    public IEnumerator<TreeNode> GetEnumerator()
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

    public TreeNode GetRoot()
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
    public TreeNode? GetTreeNode(string topic)
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
                var newNode = new TreeNode(t)
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
        TreeNode root = GetRoot();

        var topics = topic.Split('/');

        if (topics.Length == 0)
        {
            return null;
        }

        List<IMqttHandler> handlers = new();
        List<TreeNode> current = new() { root };

        foreach (var t in topics)
        {
            List<TreeNode> next = new();

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

    public List<string> GetAllSubscriptions(TreeNode? node)
    {
        List<string> subscriptions = new();

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