import { useContext, useEffect, useCallback, useState } from 'react';

import { IClientSubscribeOptions, MqttClient } from 'mqtt';

import { useMqttClient } from './MqttContext';
import { matches } from './utils/mqttHelpers';
import { Components } from '../protobuf';
import { MqttActions, MqttPublishMessage } from './MqttProtocol';

// interface IMessage {
//     topic: string;
//     msgClass: keyof typeof Components;
//     payload: any;
// }

interface IUseSubscription {
    topic: string | string[];
    client?: MqttClient | null;
    message?: MqttPublishMessage<any>;
    isConnected: boolean;
}

export default function useSubscription(
    topic: string | string[],
    options: IClientSubscribeOptions = {} as IClientSubscribeOptions,
): IUseSubscription {
    const { client, isConnected } = useMqttClient()

    const [message, setMessage] = useState<MqttPublishMessage<any>|undefined>();

    const subscribe = useCallback(async () => {
        client?.subscribe(topic, options);
    }, [client, options, topic]);

    const callback = useCallback((receivedTopic: string, receivedMessage: any) => {
        let segmentedTopic = receivedTopic.split('/');

        if (segmentedTopic.length > 3) {
            try {
                const actorId = segmentedTopic[segmentedTopic.length - 2];
                const msgClass = segmentedTopic[segmentedTopic.length - 1] as keyof typeof Components;
                const target = segmentedTopic.slice(1, -2);

                if ([topic].flat().some(rTopic => matches(rTopic, receivedTopic))) {
                    setMessage({
                        topicPrefix: {
                            action: segmentedTopic[0] as MqttActions,
                            target: target.join('/'),
                        },
                        actorId: actorId,
                        msgClass: msgClass,
                        payload: Components[msgClass].decode(receivedMessage),
                    });
                }
            } catch (error) {
                console.error('Error inside the subscription callback:', error);
            }
        }
    }, [topic]);

    useEffect(() => {
        if (isConnected) {
            subscribe();

            client!.on('message', callback);
        }

        return () => {
            client?.off('message', callback);
        };
    }, [callback, client, subscribe]);

    return {
        topic,
        message,
        isConnected,
    };
}