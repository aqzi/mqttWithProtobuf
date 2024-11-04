import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";
import { MessageFns } from "../protobuf/Test";
import { Components } from "../protobuf";

export enum ConnectionState {
	Disconnected = 0,
	Connecting = 1,
	Connected = 2,
	Reconnecting = 3
}

export type MqttActions = 'state' | 'command' | 'event';
export type MqttTopicPrefixType = { action: MqttActions, target: string };

export type MqttPublishMessage<T> = {
	topicPrefix: MqttTopicPrefixType,
	actorId: string,
	msgClass: keyof typeof Components,
	payload: T
}

export type MqttSubscribeToTopic<T> = {
	topicPrefix: MqttTopicPrefixType,
	actorId?: string,
	msgClass?: MessageFns<T>,
}