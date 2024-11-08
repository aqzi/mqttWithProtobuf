from typing import List, Dict, Optional, Iterator, Any, Union
from collections.abc import Iterable

from mqtt.mqtt_handlers.mqtt_handler import MqttHandler

class MqttTreeStructure(Iterable):
    def __init__(self, topic: str):
        self.topic = topic
        self.handlers: List[MqttHandler] = []
        self.parent: Optional['MqttTreeStructure'] = None
        self.children: Dict[str, 'MqttTreeStructure'] = {}

    def get_child(self, topic: str) -> 'MqttTreeStructure':
        return self.children[topic]

    def get_children(self) -> List['MqttTreeStructure']:
        return list(self.children.values())

    def __iter__(self) -> Iterator['MqttTreeStructure']:
        return iter(self.children.values())

    def count(self) -> int:
        return len(self.children)

    def add_handler(self, handler: MqttHandler):
        self.handlers.append(handler)

    def remove_handler(self, handler: MqttHandler):
        self.handlers.remove(handler)

    def get_handlers(self) -> List[MqttHandler]:
        return self.handlers

    def get_root(self) -> 'MqttTreeStructure':
        root = self
        while root.parent is not None:
            root = root.parent
        return root

    def get_tree_node(self, topic: str) -> Optional['MqttTreeStructure']:
        root = self.get_root()
        topics = topic.split('/')

        if not topics:
            return None

        current = root

        for t in topics:
            if t in current.children:
                current = current.get_child(t)
            else:
                return None
            
        return current

    def add_tree_node(self, topic: str, handler: Optional[MqttHandler] = None):
        topics = topic.split('/')
        
        if not topics:
            return

        current = self

        for t in topics:
            if t in current.children:
                current = current.get_child(t)
            else:
                new_node = MqttTreeStructure(t)
                new_node.parent = current
                current.children[t] = new_node
                current = new_node

        if handler:
            current.add_handler(handler)

    def get_mqtt_handlers(self, topic: str) -> List[MqttHandler]:
        root = self.get_root()
        topics = topic.split('/')

        if not topics:
            return None

        handlers = []
        current = [root]

        for t in topics:
            next_nodes = []

            for c in current:
                if t in c.children:
                    next_nodes.append(c.get_child(t))
                if "+" in c.children:
                    next_nodes.append(c.get_child("+"))
                if "#" in c.children:
                    handlers.extend(c.get_child("#").get_handlers())

            current = next_nodes

        for c in current:
            handlers.extend(c.get_handlers())

        return handlers

    def get_all_subscriptions(self, node: Optional['MqttTreeStructure']) -> List[str]:
        subscriptions = []
        tree_node = node or self.get_root()

        for key, child in tree_node.children.items():
            if child.handlers:
                subscriptions.append(key)
            
            if child.count() > 0:
                child_subscriptions = child.get_all_subscriptions(child)

                for child_sub in child_subscriptions:
                    subscriptions.append(f"{key}/{child_sub}")

        return subscriptions
