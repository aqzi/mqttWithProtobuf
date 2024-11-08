from typing import Any
from mqtt.mqtt_handlers.mqtt_handler import MqttHandler
from mqtt.mqtt_handlers.test import TestHandler


class MqttRegistry():
    def __init__(self):
        self.handlers = {}

    def get_handler(self, mqtt_service: Any) -> MqttHandler:
        return TestHandler(mqtt_service)