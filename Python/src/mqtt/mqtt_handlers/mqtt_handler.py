from typing import List, Any
from abc import ABC, abstractmethod

class MqttHandler(ABC):
    @abstractmethod
    def get_subscriptions(self) -> List[str]:
        """Returns a list of topics to subscribe to."""
        pass

    @abstractmethod
    def on_message_receive(self, topic: str, message: Any) -> None:
        """Handles received messages for a given topic."""
        pass
