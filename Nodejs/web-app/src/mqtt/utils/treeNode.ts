import IMqttHandler from "../mqttHandlers/IMqttHandler";

export default class TreeNode{
    private children: Map<string, TreeNode> = new Map();
    public topic: string;
    public handlers: IMqttHandler[] = [];
    public parent?: TreeNode;

    constructor(topic: string) {
        this.topic = topic;
    }

    public getChild(topic: string): TreeNode | undefined {
        return this.children.get(topic);
    }

    public getChildren(): TreeNode[] {
        return Array.from(this.children.values());
    }

    public count(): number {
        return this.children.size;
    }

    public addHandler(handler: IMqttHandler): void {
        this.handlers.push(handler);
    }

    public removeHandler(handler: IMqttHandler): void {
        const index = this.handlers.indexOf(handler);
        if (index !== -1) {
            this.handlers.splice(index, 1);
        }
    }

    public getHandlers(): IMqttHandler[] {
        return this.handlers;
    }

    public getRoot(): TreeNode {
        let root: TreeNode = this;
        let isRoot = false;

        while (!isRoot) {
            if(root.parent) {
                root = root.parent;
            } else {
                isRoot = true;
            }
        }
        
        return root;
    }

    public getTreeNode(topic: string): TreeNode | undefined {
        const root = this.getRoot();
        const topics = topic.split('/');

        if (topics.length === 0) {
            return undefined;
        }

        let current: TreeNode|undefined = root;

        for (const t of topics) {
            if(current?.children.has(t)) {
                current = current.getChild(t);
            } else {
                return undefined;
            }
        }

        return current;
    }

    public addTreeNode(topic: string, handler?: IMqttHandler): void {
        const topics = topic.split('/');

        if (topics.length === 0) {
            return;
        }

        let current: TreeNode|undefined = this;

        for (const t of topics) {
            if(current?.children.has(t)) {
                current = current.getChild(t);
            } else {
                const newNode = new TreeNode(t);
                newNode.parent = current;
                current?.children.set(t, newNode);
                current = newNode;
            }
        }

        if (handler) {
            current?.addHandler(handler);
        }
    }

    public getMqttHandlers(topic: string): IMqttHandler[] | null {
        const root = this.getRoot();
        const topics = topic.split('/');

        if (topics.length === 0) {
            return null;
        }

        let handlers: IMqttHandler[] = [];
        let current: TreeNode[] = [root];

        for (const t of topics) {
            const next: TreeNode[] = [];

            for (const c of current) {
                if (c.children.has(t)) {
                    const tmp = c.getChild(t);
                    if (tmp) next.push(tmp);
                }

                if (c.children.has("+")) {
                    const tmp = c.getChild("+");
                    if (tmp) next.push(tmp);
                }

                if (c.children.has("#")) {
                    const tmp = c.getChild("#");
                    if (tmp) handlers.push(...tmp.getHandlers());
                }
            }

            current = next;
        }

        for (const c of current) {
            handlers.push(...c.getHandlers());
        }

        return handlers;
    }

    public getAllSubscriptions(node?: TreeNode): string[] {
        const subscriptions: string[] = [];
        const treeNode = node ?? this.getRoot();

        for (const [key, child] of treeNode.children) {
            // Only add subscriptions that have handlers
            if (child.handlers.length > 0) {
                subscriptions.push(key);
            }

            if (child.count() > 0) {
                const childSubscriptions = child.getAllSubscriptions(child);

                for (const childSubscription of childSubscriptions) {
                    subscriptions.push(`${key}/${childSubscription}`);
                }
            }
        }

        return subscriptions;
    }
}
