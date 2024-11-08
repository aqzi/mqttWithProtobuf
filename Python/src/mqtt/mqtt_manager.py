from mqtt.mqtt_registry import MqttRegistry
from mqtt.mqtt_service import MqttService
from mqtt.mqtt_settings import MqttSettings
import protobuf.Test_pb2 as test
from datetime import datetime


#This class is responsible for subscribing to topics and receiving messages from the mqtt broker.
#The incoming messages are parsed and passed to the appropriate handler.
#This means that the responsibility of this class is to manage the mqtt registry, service and handlers.
#Additionally, it also prevents a circular dependency between mqtt_service, mqtt_registry and the handlers
#by defining the callbacks in this class.
class MqttManager():
    def __init__(self):
        # Load settings from environment
        mqtt_settings = MqttSettings.from_env()

        # Create a registry to store handlers and message parsers
        self.mqtt_registry = MqttRegistry()

        # Instantiate the MqttService with settings
        self.mqtt_service = MqttService(mqtt_settings)

        # Set the callbacks for the mqtt service
        self.mqtt_service.on_connect_callback = self.on_connect
        self.mqtt_service.on_disconnect_callback = self.on_disconnect
        self.mqtt_service.on_message_callback = self.on_message

        # Start the mqtt service
        self.initialize_mqtt()

    def initialize_mqtt(self):
        try:
            # Connect to the broker
            self.mqtt_service.start_mqtt()
        except KeyboardInterrupt:
            self.mqtt_service.stop_mqtt()

    def on_connect(self, client, rc):
        if rc == 0:
            print("Connected to MQTT Broker!")
        else:
            print(f"Failed to connect, return code {rc}")

        #TODO: add initial subscriptions here

        #TODO: remove following!
        client.subscribe('event/testje/#')

        test_msg = test.Test()
        test_msg.msg = 'Hello, World!'

        specific_datetime = datetime(2024, 11, 6, 12, 0, 0)
        test_msg.timestamp = specific_datetime

        msg = test_msg.SerializeToString()

        # Examples of publishing messages to different types of subscriptions
        client.publish('event/testje/python/Test', payload=msg)

    def on_disconnect(self):
        print("Disconnected from MQTT Broker!")

    def on_message(self, message):
        arr_topic = message.topic.split('/')
        print(f"Received: {message.topic}")

        message_type_name = arr_topic[-1]
        actor_id = arr_topic[-2]

        #TODO: fix this!
        test_msg = test.Test()
        test_msg.ParseFromString(message.payload)

        handler = self.mqtt_registry.get_handler(self.mqtt_service)

        if handler is not None:
            handler.on_message_receive(message.topic, test_msg)