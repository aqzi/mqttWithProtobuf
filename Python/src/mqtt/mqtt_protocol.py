from enum import Enum

class MqttAction(Enum):
    STATE = "STATE"
    COMMAND = "COMMAND"
    EVENT = "EVENT"
