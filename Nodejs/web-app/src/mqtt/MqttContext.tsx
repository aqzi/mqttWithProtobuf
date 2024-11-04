import React, { createContext, useContext, useEffect, useState } from 'react';
import mqtt, { IClientOptions, IClientPublishOptions, MqttClient } from 'mqtt';
import { MqttSubscribeToTopic, MqttPublishMessage } from './MqttProtocol';
import { Buffer } from 'buffer';
import { Components } from '../protobuf';

interface MqttContextType {
    client: MqttClient | null;
    isConnected: boolean;
    publish: <T>(msg: MqttPublishMessage<T>, opts?: IClientPublishOptions) => void;
    subscribe: <T>(topic: MqttSubscribeToTopic<T>) => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

const MqttProvider: React.FC<{ brokerUrl: string, opts: IClientOptions, children: React.ReactNode }> = ({ brokerUrl, opts, children }) => {
    const [client, setClient] = useState<MqttClient | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const mqttClient = mqtt.connect(brokerUrl, opts);

        mqttClient.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to MQTT broker');
        });

        mqttClient.on('error', (error) => {
            console.error('MQTT connection error:', error);
        });

        mqttClient.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from MQTT broker');
        });

        setClient(mqttClient);

        return () => {
            mqttClient.end();
        };
    }, [brokerUrl, opts]);

    function publish <T>(msg: MqttPublishMessage<T>, opts?: IClientPublishOptions) {
		if (client && isConnected) {
            const encoding = Components[msg.msgClass].encode(msg.payload as any).finish();
			const buffer = Buffer.from(encoding);

			let action = msg.topicPrefix.action;

			client.publish(
				`${action}/${msg.topicPrefix.target}/${msg.actorId}/${msg.msgClass.toString()}`, 
				buffer, opts ?? {qos: 0, retain: action === 'state'}
			);
		} else {
            console.error('Client not connected asdf  asdf  sdf');
        }
	};

    function subscribe <T>(topic: MqttSubscribeToTopic<T>) {
        if (client && isConnected) {
            const actorId = topic.actorId ? `/${topic.actorId}` : '';
            const msgType = topic.msgClass ? `/${topic.msgClass.toString()}` : '';
            
            const result = `${topic.topicPrefix.action}/${topic.topicPrefix.target}` + actorId + msgType;

            client.subscribe(result, (err) => {
                if (err) {
                    console.error(`Failed to subscribe to topic ${topic}:`, err);
                }
            });
        } else {
            console.error('Client not connected');
        }
    };

    return (
        <MqttContext.Provider value={{ client, isConnected, publish, subscribe }}>
            {children}
        </MqttContext.Provider>
    );
};

const useMqttClient = () => {
    const context = useContext(MqttContext);

    if (context === undefined) {
        throw new Error('useMqttClient must be used within a MqttProvider');
    }

    return context;
};

export { MqttProvider, useMqttClient };
