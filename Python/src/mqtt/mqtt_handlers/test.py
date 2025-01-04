from typing import List
from mqtt.mqtt_handlers.mqtt_handler import MqttHandler
from mqtt.mqtt_service import MqttAction, MqttService
import protobuf.Test_pb2 as test


class TestHandler(MqttHandler):
    def __init__(self, mqtt_service: MqttService):
        self.mqtt_service = mqtt_service
        self.subscriptions = [
            "event/test/#"
        ]

    def get_subscriptions(self) -> List[str]:
        return self.subscriptions

    def on_message_receive(self, topic: str, message: object) -> None:
        print(f"TestHandler received message on topic {topic}")

        match message:
            case test.Test():
                # Create a new message with modified content
                msg = test.Test(
                    timestamp=message.timestamp,
                    msg=f"Echo through python => {message.msg}"
                )

                # Publish the message to the MQTT service
                self.mqtt_service.publish(
                    action=MqttAction.EVENT,
                    target="testPython",
                    actor_id="python",
                    message_namespace="Test",
                    message_type="Test",
                    payload=msg.SerializeToString()
                )
            case test.User():
                # Create a new message with modified content
                msg = test.User(
                    timestamp=message.timestamp,
                    name=f"{message.name} [Python]",
                    age=message.age
                )

                # Publish the message to the MQTT service
                self.mqtt_service.publish(
                    action=MqttAction.EVENT,
                    target="testPython",
                    actor_id="python",
                    message_namespace="Test",
                    message_type="User",
                    payload=msg.SerializeToString()
                )
            case test.TestWithAnimal():
                # Create a new message with modified content
                msg = test.TestWithAnimal(
                    timestamp=message.timestamp,
                    isResponse=True,
                    animal=message.animal
                )

                # Publish the message to the MQTT service
                self.mqtt_service.publish(
                    action=MqttAction.EVENT,
                    target="testPython",
                    actor_id="python",
                    message_namespace="Test",
                    message_type="TestWithAnimal",
                    payload=msg.SerializeToString()
                )
                
            case _:
                print("Unknown message received")