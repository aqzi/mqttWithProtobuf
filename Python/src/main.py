import asyncio
import paho.mqtt.client as mqtt
from mqtt.mqtt_manager import MqttManager
from mqtt.mqtt_registry import MqttRegistry
from mqtt.mqtt_service import MqttService
from mqtt.mqtt_settings import MqttSettings
import protobuf.Test_pb2 as test
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def main():
    MqttManager()

if __name__ == "__main__":
    main()