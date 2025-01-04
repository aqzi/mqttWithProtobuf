import { useEffect, useState } from "react";
import { Test, User, TestWithAnimal } from "../protobuf/Test";
import { useMqttClient } from "../mqtt/MqttContext";
import { MqttActions, MqttMsgClass } from "../mqtt/mqttProtocol";
import { Components } from "../protobuf";
import { AnimalType, animalTypeFromJSON } from "../protobuf/Animal";

const PUBLISH_TOPIC_TEST_MSG = 'event/test/frontend/Test.Test';
const PUBLISH_TOPIC_USER_MSG = 'event/test/frontend/Test.User';
const PUBLISH_TOPIC_ANIMAL_MSG = 'event/test/frontend/Test.TestWithAnimal';

//TODO: avoid code duplication for the submit functions

const PublishMsg = () => {
    const { publish } = useMqttClient();

    const [testMsg, setTestMsg] = useState<Test>({timestamp: new Date(), msg: 'Hello world!'});
    const [userMsg, setUserMsg] = useState<User>({timestamp: new Date(), name: 'John Doe', age: 42});
    const [animalMsg, setAnimalMsg] = useState<TestWithAnimal>({
        timestamp: new Date(), isResponse: false, animal: {animalName: 'Maoui', animalType: AnimalType.CAT}
    });

    const onSubmitTestMsg = () => {
        testMsg.timestamp = new Date();

        const topicSegments = PUBLISH_TOPIC_TEST_MSG.split('/');

        const action = topicSegments[0] as MqttActions;
        const target = topicSegments.slice(1, -2).join('/');
        const actorId = topicSegments[topicSegments.length - 2];

        const tmp = topicSegments[topicSegments.length - 1].split('.');
        const msgClass = {
            namespace: tmp[0],
            msgType: tmp[1]
        } as MqttMsgClass;

        publish({topicPrefix: {action, target}, actorId, msgClass, payload: testMsg});
    };

    const onSubmitUserMsg = () => {
        userMsg.timestamp = new Date();

        const topicSegments = PUBLISH_TOPIC_USER_MSG.split('/');

        const action = topicSegments[0] as MqttActions;
        const target = topicSegments.slice(1, -2).join('/');
        const actorId = topicSegments[topicSegments.length - 2];

        const tmp = topicSegments[topicSegments.length - 1].split('.');
        const msgClass = {
            namespace: tmp[0],
            msgType: tmp[1]
        } as MqttMsgClass;

        publish({topicPrefix: {action, target}, actorId, msgClass, payload: userMsg});
    }

    const onSubmitAnimalMsg = () => {
        let msg = {...animalMsg};

        msg.timestamp = new Date();
        if (msg.animal) {
            msg.animal.animalType = animalTypeFromJSON(animalMsg.animal?.animalType!);
        }

        const topicSegments = PUBLISH_TOPIC_ANIMAL_MSG.split('/');

        const action = topicSegments[0] as MqttActions;
        const target = topicSegments.slice(1, -2).join('/');
        const actorId = topicSegments[topicSegments.length - 2];

        const tmp = topicSegments[topicSegments.length - 1].split('.');
        const msgClass = {
            namespace: tmp[0],
            msgType: tmp[1]
        } as MqttMsgClass;

        publish({topicPrefix: {action, target}, actorId, msgClass, payload: animalMsg});
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
                        onChange={(e) => setTestMsg({
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
                        onChange={(e) => setUserMsg({
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
                        onChange={(e) => setUserMsg({
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
            <div className="bg-[#292b34] p-4">
                <div>
                    <h1 className="text-2xl mb-2 font-bold">Animal msg:</h1>
                    Animal name: 
                    <input 
                        type="text" 
                        className="bg-transparent border rounded-lg mx-2 px-1" 
                        value={animalMsg.animal!.animalName} 
                        onChange={(e) => setAnimalMsg({
                            timestamp: new Date(),
                            isResponse: animalMsg.isResponse,
                            animal: {
                                animalName: e.target.value,
                                animalType: animalMsg.animal!.animalType
                            }
                        })}
                        placeholder="Type your animal name"
                    />
                    Animal type:
                    <select
                        value={animalMsg.animal!.animalType}
                        onChange={(e) => setAnimalMsg({
                            timestamp: new Date(),
                            isResponse: animalMsg.isResponse,
                            animal: {
                                animalName: animalMsg.animal!.animalName,
                                animalType: e.target.value as unknown as AnimalType
                            }
                        })}
                        className="bg-transparent border rounded-lg mx-2 px-1"
                    >
                        {Object.values(AnimalType).filter(i => typeof i === 'string' && i !== 'UNKNOWN' && i !== 'UNRECOGNIZED')
                            .map((animal) => (
                                <option key={animal} value={animal}>
                                    {animal}
                                </option>
                        ))}
                    </select>
                </div>
                <button 
                    className="bg-blue-500 p-2 mt-5 whitespace-nowrap w-min" 
                    onClick={onSubmitAnimalMsg}
                >
                    Send animal message
                </button>
            </div>
        </div>
    )
}

export default PublishMsg;