import { useContext, useEffect, useCallback, useState } from 'react';

import { IClientSubscribeOptions, MqttClient } from 'mqtt';

import { useMqttClient } from './MqttContext';
import { matches } from './mqttTopicVerifier';
import { Components } from '../protobuf';
import { MqttActions, MqttMessage } from './mqttProtocol';
import { Test } from '../protobuf/Test';

interface IUseSubscription {
    topic: string | string[];
    client?: MqttClient | null;
    message?: MqttMessage<any>;
    isConnected: boolean;
}

export default function useSubscription(
    topic: string | string[],
    onReceive: (message: MqttMessage<any>) => void,
    options: IClientSubscribeOptions = {} as IClientSubscribeOptions,
): IUseSubscription {
    const { client, isConnected } = useMqttClient()

    const subscribe = useCallback(async (topic: string|string[]) => {
        client?.subscribe(topic, options);
    }, [client, options, topic]);

    const callback = useCallback((receivedTopic: string, receivedMessage: any) => {
        let segmentedTopic = receivedTopic.split('/');

        if (segmentedTopic.length > 3) {
            try {
                const actorId = segmentedTopic[segmentedTopic.length - 2];
                const target = segmentedTopic.slice(1, -2);

                const segmentedMsgClass = segmentedTopic[segmentedTopic.length - 1].split('.');
                const msgNamespace = segmentedMsgClass[0] as keyof typeof Components;
                const msgType = segmentedMsgClass[1] as Exclude<keyof typeof Components[keyof typeof Components], "protobufPackage">;

                if ([topic].flat().some(rTopic => matches(rTopic, receivedTopic))) {
                    onReceive({
                        topicPrefix: {
                            action: segmentedTopic[0] as MqttActions,
                            target: target.join('/'),
                        },
                        actorId: actorId,
                        msgClass: {namespace: msgNamespace, msgType: msgType},
                        payload: (Components[msgNamespace][msgType] as any).decode(receivedMessage),
                    });
                }
            } catch (error) {
                console.error('Error inside the subscription callback:', error);
            }
        }
    }, [topic]);

    useEffect(() => {
        if (isConnected) {
            subscribe(topic);

            client!.on('message', callback);
        }

        return () => {
            client?.off('message', callback);
        };
    }, [callback, client, subscribe]);

    return {
        topic,
        isConnected,
    };
}