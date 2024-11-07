from dataclasses import dataclass
import os

@dataclass
class MqttSettings:
    host: str = "localhost"
    port: int = 8080
    is_tls_enabled: bool = False
    user: str = "python"
    password: str = "password"
    retry_interval_in_sec: int = 5
    client_id: str = "python"

    @classmethod
    def from_env(cls):
        #Creates an instance of MqttSettings using environment variables.
        return cls(
            host=os.getenv('MQTT_HOST'),
            port=int(os.getenv('MQTT_PORT')),
            is_tls_enabled=os.getenv('MQTT_IS_TLS_ENABLED').lower() in ('true', '1', 'yes'),
            user=os.getenv('MQTT_USER'),
            password=os.getenv('MQTT_PASSWORD'),
            retry_interval_in_sec=float(os.getenv('MQTT_RETRY_INTERVAL_IN_SEC')),
            client_id=os.getenv('MQTT_CLIENT_ID'),
        )