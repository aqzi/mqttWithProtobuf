import asyncio
from datetime import datetime
import logging
from typing import List
import paho.mqtt.client as mqtt
from mqtt.mqtt_registry import MqttRegistry
import protobuf.Test_pb2 as test
from mqtt.mqtt_protocol import MqttAction
from mqtt.mqtt_settings import MqttSettings

class MqttService:
    def __init__(self, mqtt_settings: MqttSettings, mqtt_registry: MqttRegistry):
        self.logger = logging.getLogger(__name__)

        self.mqtt_settings = mqtt_settings
        self.mqtt_registry = mqtt_registry

        self.client = mqtt.Client(transport='websockets')

        self.client.username_pw_set(mqtt_settings.user, mqtt_settings.password)

        # Certificate is required when using TLS endpoint (mqtts, wss, ssl)!
        if mqtt_settings.is_tls_enabled:
            self.client.tls_set()

        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect

    async def connect(self):
        # Start the client loop in a background thread
        self.client.loop_start()
        
        print(f"Connecting to {self.mqtt_settings.host}:{self.mqtt_settings.port}")
        await asyncio.to_thread(self.client.connect, self.mqtt_settings.host, self.mqtt_settings.port)

    async def disconnect(self):
        # Disconnect and stop the loop
        await asyncio.to_thread(self.client.disconnect)
        self.client.loop_stop()

    def on_connect(self, client: mqtt.Client, userdata, flags, rc: int):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print(f"Failed to connect, return code {rc}")

        #TODO: remove following!
        self.client.subscribe('event/testje/#')

        test_msg = test.Test()
        test_msg.msg = 'Hello, World!'

        specific_datetime = datetime(2024, 11, 6, 12, 0, 0)
        test_msg.timestamp = specific_datetime

        msg = test_msg.SerializeToString()

        # Examples of publishing messages to different types of subscriptions
        self.client.publish('event/testje/python/Test', payload=msg)

    def on_message(self, client: mqtt.Client, userdata, msg: mqtt.MQTTMessage):
        arr_topic = msg.topic.split('/')
        print(f"Received: {msg.topic}")

        message_type_name = arr_topic[-1]
        actor_id = arr_topic[-2]

        #TODO: fix this!
        test_msg = test.Test()
        test_msg.ParseFromString(msg.payload)

        handler = self.mqtt_registry.get_handler()

        if handler is not None:
            handler.on_message_receive(msg.topic, test_msg)

    def on_disconnect(self, client: mqtt.Client, userdata, rc: int):
        print(f'Disconnected (Result: {rc})')

    def publish(self, action: MqttAction, target: str, actor_id: str, message_type: str, payload: bytes):
        """Publishes a message to a specific MQTT topic."""
        if self.client.is_connected():
            try:
                topic = f"{action.value.lower()}/{target}/{actor_id}/{message_type}"

                # Publish the message
                result = self.client.publish(
                    topic=topic,
                    payload=payload,
                    qos=1, #qos=1 --> AtLeastOnce
                    retain=True
                )

                # Wait for the message to be published
                result.wait_for_publish()
                
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
