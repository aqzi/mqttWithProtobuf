import { useEffect } from "react";
import { Test } from "./protobuf/Test";
import { Components } from "./protobuf";
import { useMqttClient } from "./mqtt/MqttContext";
import useSubscription from "./mqtt/UseSubscription";

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
        <div className="publishMsg">
            <button onClick={onSubmit}>Send message to .NET worker</button>
        </div>
    )
}

export default PublishMsg;