import { useEffect, useState } from "react";
import { useMqttClient } from "../MqttContext";

const MqttHandlers = () => {
    const { client } = useMqttClient();
    const [msgClass, setMsgClass] = useState<string>();

    //onMessageReceive
    useEffect(() => {
        if (client) {
            client.on('message', (topic, message) => {
                let arrTopic = topic.split('/');

                if (arrTopic.length > 2) {
                    const actionType = arrTopic[0];
                    let actorId = arrTopic[arrTopic.length - 2];
                    setMsgClass(arrTopic[arrTopic.length - 1]);

                    if(actionType !== 'state' && actionType !== 'event' && actionType !== 'command') {
                        console.log('invalid action');
                        return null;
                    }
                }

                console.log('Received message:', topic, message.toString())
            })
        }
    }, [client])

    return (
        <div>
            <h1>MqttHandlers</h1>
        </div>
    )
}