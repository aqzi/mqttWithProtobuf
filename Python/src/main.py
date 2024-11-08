import asyncio
import paho.mqtt.client as mqtt
from mqtt.mqtt_manager import MqttManager
from mqtt.mqtt_registry import MqttRegistry
from mqtt.mqtt_service import MqttService
from mqtt.mqtt_settings import MqttSettings
import protobuf.Test_pb2 as test
from datetime import datetime
from dotenv import load_dotenv

# # Callback on connection
# def on_connect(client: mqtt.Client, userdata, flags, rc: int):
#     print(f'Connected (Result: {rc})')

#     # See: https://docs.solace.com/Open-APIs-Protocols/MQTT/MQTT-Topics.htm
#     client.subscribe('foo')
#     client.subscribe('hello/#')
#     client.subscribe('languages/+')
#     client.subscribe('game/+/move')

#     test_msg = test.Test()
#     test_msg.msg = 'Hello, World!'

#     specific_datetime = datetime(2024, 11, 6, 12, 0, 0)
#     test_msg.timestamp = specific_datetime

#     msg = test_msg.SerializeToString()

#     # Examples of publishing messages to different types of subscriptions
#     client.publish('foo', payload=msg)
#     client.publish('foo/foo', payload='will not be seen, no one is subscribed to this topic')

#     client.publish('hello', payload='world')
#     client.publish('hello/world/canada/ottawa', payload='# matches any level')

#     client.publish('languages/python2', payload='eol')
#     client.publish('languages/python3', payload='valid')
#     client.publish('languages/other/level', payload='will not be seen, + only matches one level')

#     client.publish('game/player1/move', payload='Moving to (1, 2)')
#     client.publish('game/player2/move', payload='Moving to (3, 4)')


# # Callback when message is received
# def on_message(client: mqtt.Client, userdata, msg: mqtt.MQTTMessage):
#     print(f'Message received on topic: {msg.topic}. Message: {msg.payload}')

#     if msg.topic == 'foo':
#         test_msg = test.Test()
#         test_msg.ParseFromString(msg.payload)
#         print(f'Parsed message: {test_msg.msg}, Timestamp: {test_msg.timestamp}')

# def on_disconnect(client: mqtt.Client, userdata, rc: int):
#     print(f'Disconnected (Result: {rc})')


# # If using websockets (protocol is ws or wss), must set the transport for the client as below
# client = mqtt.Client(transport='websockets')

# client.on_connect = on_connect
# client.on_message = on_message
# client.on_disconnect = on_disconnect

# client.username_pw_set('python', 'password')

# # Certificate is required when using TLS endpoint (mqtts, wss, ssl)!
# client.connect('localhost', port=8080, keepalive=5, bind_address='')

# client.loop_forever()


load_dotenv()

def main():
    MqttManager()

if __name__ == "__main__":
    main()