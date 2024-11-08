import { useEffect, useState } from "react";
import { Test, User } from "../protobuf/Test";
import { useMqttClient } from "../mqtt/MqttContext";
import { MqttActions } from "../mqtt/mqttProtocol";
import { Components } from "../protobuf";

const PUBLISH_TOPIC_TEST_MSG = 'event/test/frontend/Test';
const PUBLISH_TOPIC_USER_MSG = 'event/test/frontend/User';

const PublishMsg = () => {
    const { publish } = useMqttClient();

    const [testMsg, setTestMessage] = useState<Test>({timestamp: new Date(), msg: 'Hello world!'});
    const [userMsg, setUserMessage] = useState<User>({timestamp: new Date(), name: 'John Doe', age: 42});

    const onSubmitTestMsg = () => {
        testMsg.timestamp = new Date();

        const topicSegments = PUBLISH_TOPIC_TEST_MSG.split('/');

        const action = topicSegments[0] as MqttActions;
        const target = topicSegments.slice(1, -2).join('/');
        const actorId = topicSegments[topicSegments.length - 2];
        const msgClass = topicSegments[topicSegments.length - 1] as keyof typeof Components;

        publish({topicPrefix: {action, target}, actorId, msgClass, payload: testMsg});
    };

    const onSubmitUserMsg = () => {
        userMsg.timestamp = new Date();

        const topicSegments = PUBLISH_TOPIC_USER_MSG.split('/');

        const action = topicSegments[0] as MqttActions;
        const target = topicSegments.slice(1, -2).join('/');
        const actorId = topicSegments[topicSegments.length - 2];
        const msgClass = topicSegments[topicSegments.length - 1] as keyof typeof Components;

        publish({topicPrefix: {action, target}, actorId, msgClass, payload: userMsg});
    }

    return (
        <div className="flex flex-row gap-10">
            <div className="bg-[#292b34] p-4">
                <div>
                    <h1 className="text-2xl mb-2 font-bold">Test msg:</h1>
                    Message: 
                    <input 
                        type="text" 
                        className="bg-transparent border rounded-lg mx-2 px-1" 
                        value={testMsg.msg} 
                        onChange={(e) => setTestMessage({
                            timestamp: new Date(),
                            msg: e.target.value
                        })}
                        placeholder="Type your message"
                    />
                </div>
                <button 
                    className="bg-blue-500 p-2 mt-5 whitespace-nowrap w-min" 
                    onClick={onSubmitTestMsg}
                >
                    Send test message
                </button>
            </div>
            <div className="bg-[#292b34] p-4">
                <div>
                    <h1 className="text-2xl mb-2 font-bold">User msg:</h1>
                    Name: 
                    <input 
                        type="text" 
                        className="bg-transparent border rounded-lg mx-2 px-1" 
                        value={userMsg.name} 
                        onChange={(e) => setUserMessage({
                            timestamp: new Date(),
                            name: e.target.value,
                            age: userMsg.age
                        })}
                        placeholder="Type your message"
                    />
                    Age:
                    <input
                        type="number"
                        inputMode="numeric"
                        className="bg-transparent mx-2 text-sm border border-slate-200 rounded-md px-3 py-2"
                        maxLength={5}
                        value={userMsg.age}
                        onChange={(e) => setUserMessage({
                            timestamp: new Date(),
                            name: userMsg.name,
                            age: parseInt(e.target.value)
                        })}
                    />
                </div>
                <button 
                    className="bg-blue-500 p-2 mt-5 whitespace-nowrap w-min" 
                    onClick={onSubmitUserMsg}
                >
                    Send user message
                </button>
            </div>
        </div>
    )
}

export default PublishMsg;