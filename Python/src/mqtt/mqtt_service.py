from enum import Enum
import logging
from typing import Any, Callable, List
import paho.mqtt.client as mqtt
from mqtt.mqtt_settings import MqttSettings

class MqttAction(Enum):
    STATE = "STATE"
    COMMAND = "COMMAND"
    EVENT = "EVENT"

class MqttService:
    def __init__(self, mqtt_settings: MqttSettings):
        self.logger = logging.getLogger(__name__)

        self.mqtt_settings = mqtt_settings

        self.on_connect_callback: Callable[[mqtt.Client, Any, Any, int], None]
        self.on_disconnect_callback: Callable[[mqtt.Client, Any, int], None]
        self.on_message_callback: Callable[[mqtt.MQTTMessage], None]

    def start_mqtt(self):
        print(f"Connecting to {self.mqtt_settings.host}:{self.mqtt_settings.port}")

        self.client = mqtt.Client(transport='websockets')

        self.client.username_pw_set(self.mqtt_settings.user, self.mqtt_settings.password)

        # Certificate is required when using TLS endpoint (mqtts, wss, ssl)!
        if self.mqtt_settings.is_tls_enabled:
            self.client.tls_set()

        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect

        self.client.connect(self.mqtt_settings.host, port=self.mqtt_settings.port, keepalive=5,)

        self.client.loop_forever()

    def stop_mqtt(self):
        self.client.disconnect()

    def on_connect(self, client: mqtt.Client, userdata, flags, rc: int):
        if self.on_connect_callback is not None:
            self.on_connect_callback(client, rc)

    def on_message(self, client: mqtt.Client, userdata, msg: mqtt.MQTTMessage):
        if self.on_message_callback is not None:
            self.on_message_callback(msg)

    def on_disconnect(self, client: mqtt.Client, userdata, rc: int):
        #TODO: add reconnect logic here

        if self.on_disconnect_callback is not None:
            self.on_disconnect_callback()

    def publish(self, action: MqttAction, target: str, actor_id: str, message_namespace: str, message_type: str, payload: bytes):
        """Publishes a message to a specific MQTT topic."""
        if self.client.is_connected():
            try:
                topic = f"{action.value.lower()}/{target}/{actor_id}/{message_namespace}.{message_type}"

                # Publish the message
                result = self.client.publish(
                    topic=topic,
                    payload=payload,
                    qos=1, #qos=1 --> AtLeastOnce
                    retain=True
                )
                
                if result.rc != mqtt.MQTT_ERR_SUCCESS:
                    self.logger.error(f"Failed to publish message to {topic}")

            except Exception as e:
                self.logger.error(f"Publish to {topic} failed: {e}")
        else:
            self.logger.warning("MQTT client is not connected")

    def subscribe(self, topics: List[str]):
        """Subscribes to a list of topics."""
        if self.client.is_connected():
            for topic in topics:
                self.client.subscribe(topic)
        else:
            self.logger.warning("MQTT client is not connected")
