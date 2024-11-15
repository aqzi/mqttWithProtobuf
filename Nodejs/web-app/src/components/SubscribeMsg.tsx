import { Test, User } from "../protobuf/Test";
import useSubscription from "../mqtt/UseSubscription";
import { useRef, useState } from "react";
import { MqttMessage } from "../mqtt/mqttProtocol";

const SubscribeMsg = () => {
    const [messages, setMessages] = useState<MqttMessage<Test|User>[]>([]);

    const counter = useRef(0);

    const handleReceive = (message: MqttMessage<any>) => {
        let tmp: MqttMessage<Test|User>;
        
        if (message.msgClass.msgType === 'Test') {
            tmp = message as MqttMessage<Test>;
        } else {
            tmp = message as MqttMessage<User>;
        }

        
        // Add the new message to the list of messages and make sure the list is not longer than 5 messages
        setMessages(prev => [tmp, ...prev].slice(0, 6));

        counter.current++;
    };

    useSubscription(
        [
            'event/testPython/#',
            'event/testDotnet/#'
        ],
        handleReceive
    )

    const PayloadInfo: React.FC<{msg: MqttMessage<Test|User>}> = ({msg}) => {
        if (msg.msgClass.msgType === 'Test') {
            const tmp = msg.payload as Test;

            return (
                <li className="text-blue-400">Message: {tmp.msg}</li>
            );
        } else {
            const tmp = msg.payload as User;
            
            return (
                <>
                    <li className="text-blue-400">Name: {tmp.name}</li>
                    <li className="text-blue-400">Age: {tmp.age}</li>
                </>
            );
        }
    }
    
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
                            {/* <li>MsgNamespace: {msg.msgClass.namespace}</li>
                            <li>MsgType: {msg.msgClass.msgType}</li> */}
                            <PayloadInfo msg={msg}/>
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