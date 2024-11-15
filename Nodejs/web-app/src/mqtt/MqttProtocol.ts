import { Components } from "../protobuf";

export enum ConnectionState {
	Disconnected = 0,
	Connecting = 1,
	Connected = 2,
	Reconnecting = 3
}

export type MqttNamespace = keyof typeof Components;

export type MqttActions = 'state' | 'command' | 'event';
export type MqttTopicPrefixType = { action: MqttActions, target: string };
export type MqttMsgClass = {
	[N in MqttNamespace]: {
		namespace: N;
		msgType: Exclude<keyof typeof Components[N], "protobufPackage">;
	};
}[MqttNamespace];

export type MqttMessage<T> = {
	topicPrefix: MqttTopicPrefixType,
	actorId: string,
	msgClass: MqttMsgClass,
	payload: T
}