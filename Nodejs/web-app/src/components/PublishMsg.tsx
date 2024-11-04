import { Test } from "../protobuf/Test";
import { useMqttClient } from "../mqtt/MqttContext";

const PublishMsg = () => {
    const { publish } = useMqttClient();

    const onSubmit = () => {
        const msg: Test = {
            timestamp: new Date(),
            msg: 'Hello from the frontend!'
        }

        publish({topicPrefix: {action: 'event', target: 'test'}, actorId: 'frontend', msgClass: 'Test', payload: msg});
    };

    return (
        <div className="mt-50">
            <button 
                className="bg-blue-500 p-2" 
                onClick={onSubmit}
            >
                Send message
            </button>
        </div>
    )
}

export default PublishMsg;