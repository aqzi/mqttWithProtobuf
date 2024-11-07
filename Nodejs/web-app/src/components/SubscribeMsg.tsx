import { Test } from "../protobuf/Test";
import useSubscription from "../mqtt/UseSubscription";
import { useEffect, useRef, useState } from "react";
import { MqttMessage } from "../mqtt/mqttProtocol";

const SubscribeMsg = () => {
    const [messages, setMessages] = useState<MqttMessage<Test>[]>([]);

    const counter = useRef(0);
    
    const {message} = useSubscription('event/testPython/#');

    useEffect(() => {
        if (message) {
            const tmp = message as MqttMessage<Test>;
            
            // Add the new message to the list of messages and make sure the list is not longer than 5 messages
            setMessages(prev => [tmp, ...prev].slice(0, 6));

            counter.current++;
        }
    }, [message]);
    
    return (
        <div className="mt-20">
            <h1 className="text-4xl">Messages (max 6):</h1>
            <div className="flex flex-wrap flex-grow gap-4 mt-8">
                {messages.map((msg, idx) => (
                    <div className="p-4 pl-8 border rounded-lg w-96" key={idx}>
                        <ul className="list-disc">
                            <li>Action: {msg.topicPrefix.action}</li>
                            <li>Actor: {msg.actorId}</li>
                            <li>Target: {msg.topicPrefix.target}</li>
                            <li>Message: {msg.payload.msg}</li>
                            <li>Timestamp: {msg.payload.timestamp?.toLocaleDateString()}, {msg.payload.timestamp?.toLocaleTimeString()}</li>
                            <li className="font-bold">Seq nr: {counter.current - idx} {idx === 0 ? ' --> [most recent]' : ''}</li>
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SubscribeMsg;