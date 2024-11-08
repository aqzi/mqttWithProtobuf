from typing import List
from mqtt.mqtt_handlers.mqtt_handler import MqttHandler
from mqtt.mqtt_protocol import MqttAction
from mqtt.mqtt_service import MqttService
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
                    message_type="Test",
                    payload=msg.SerializeToString()
                )
                
            case _:
                print("Unknown message received")