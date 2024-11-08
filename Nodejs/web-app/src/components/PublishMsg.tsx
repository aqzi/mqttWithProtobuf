import { useEffect, useState } from "react";
import { Test } from "../protobuf/Test";
import { useMqttClient } from "../mqtt/MqttContext";
import { MqttActions } from "../mqtt/mqttProtocol";
import { Components } from "../protobuf";

const PUBLISH_TOPIC = 'event/test/frontend/Test';

const PublishMsg = () => {
    const { publish } = useMqttClient();

    const [message, setMessage] = useState<Test>({timestamp: new Date(), msg: 'Hello from the frontend!'});

    const onSubmit = () => {
        message.timestamp = new Date();

        const topicSegments = PUBLISH_TOPIC.split('/');

        const action = topicSegments[0] as MqttActions;
        const target = topicSegments.slice(1, -2).join('/');
        const actorId = topicSegments[topicSegments.length - 2];
        const msgClass = topicSegments[topicSegments.length - 1] as keyof typeof Components;

        publish({topicPrefix: {action, target}, actorId, msgClass, payload: message});
    };

    return (
        <div className="p-4 flex flex-col gap-3 bg-[#292b34]">
            <div>
                <h1 className="text-2xl mb-2 mt-4 font-bold">MqttMessage:</h1>
                Message: 
                <input 
                    type="text" 
                    className="bg-transparent border rounded-lg mx-2 px-1" 
                    value={message.msg} 
                    onChange={(e) => setMessage({
                        timestamp: new Date(),
                        msg: e.target.value
                    })}
                    style={{
                        width: `${Math.max(message.msg.length + 1, 10)}ch`,
                        minWidth: '200px'
                    }}
                    placeholder="Type your message"
                />
            </div>
            <button 
                className="bg-blue-500 p-2 mt-5 whitespace-nowrap w-min" 
                onClick={onSubmit}
            >
                Send message
            </button>
        </div>
    )
}

export default PublishMsg;