import importlib
import inspect
import os
import pkgutil
import sys
from typing import Dict, List, Optional
from mqtt.mqtt_handlers.mqtt_handler import MqttHandler
# from mqtt.mqtt_handlers.test import TestHandler
from mqtt.mqtt_service import MqttService
from google.protobuf.message import Message
from mqtt.mqtt_tree_structure import MqttTreeStructure

# Modify the path to include src (parent of current directory)
# sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
# sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'mqtt_handlers'))

# Import protobuf and mqtt_handlers package
import protobuf
import mqtt.mqtt_handlers
    

class MqttRegistry():
    def __init__(self, mqtt_service: MqttService):
        self.parsers: Dict[str, Message] = {}
        self.handlers = MqttTreeStructure("root")

        self.mqtt_service = mqtt_service
        
        self.cache_parsers()
        self.cache_handlers()
        
        self.handlers.add_tree_node("state", handler=None)
        self.handlers.add_tree_node("command", handler=None)
        self.handlers.add_tree_node("event", handler=None)

    def cache_parsers(self):
        # Dynamically load all modules within protobuf
        for _, module_name, _ in pkgutil.iter_modules(protobuf.__path__):
            module = importlib.import_module(f"protobuf.{module_name}")

            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                
                # Check if the attribute is a protobuf message class
                if isinstance(attr, type) and issubclass(attr, Message):
                    msg_namespace = attr.DESCRIPTOR.full_name.split('.')[0].capitalize() #get namespace

                    # Store the message class in a dictionary for instantiation later
                    self.parsers[msg_namespace + "." + attr_name] = attr

    def cache_handlers(self):
        # Loop through all modules in mqtt_handlers directory
        for module_info in pkgutil.iter_modules(mqtt.mqtt_handlers.__path__):
            module_name = module_info.name
            module = importlib.import_module(f"mqtt.mqtt_handlers.{module_name}")

            # Find all classes that subclass MqttHandler within the module
            for _, cls in inspect.getmembers(module, inspect.isclass):
                if issubclass(cls, MqttHandler) and cls is not MqttHandler:
                    init_signature = inspect.signature(cls.__init__)

                    # Instantiate the handler with or without mqtt_service
                    if 'mqtt_service' in init_signature.parameters:
                        handler_instance = cls(self.mqtt_service)
                    else:
                        handler_instance = cls()

                    # Register each handler instance with the appropriate topics
                    for topic in handler_instance.get_subscriptions():
                        self.handlers.add_tree_node(topic, handler_instance)

    def try_get_parser(self, type_name: str) -> Optional[Message]:
        return self.parsers.get(type_name)

    def try_get_handlers(self, topic: str) -> List[MqttHandler]:
        return self.handlers.get_mqtt_handlers(topic)

    def get_all_subscriptions(self) -> List[str]:
        return self.handlers.get_all_subscriptions(node=None)