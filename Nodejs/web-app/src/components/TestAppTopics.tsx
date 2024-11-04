import { useState } from "react";

const TestAppTopics = () => {
    const [publishTopic, setPublishTopic] = useState<string>('');
    const [subscribeTopics, setSubscribeTopics] = useState<string[]>(['']);

    const handleSubscribeTopicsChange = (index: number, value: string) => {
        const updatedTopics = [...subscribeTopics];
        updatedTopics[index] = value;
        setSubscribeTopics(updatedTopics);
    };

    const addSubscribeTopic = () => {
        setSubscribeTopics([...subscribeTopics, '']); // Add a new empty string
    };

    const removeSubscribeTopic = (index: number) => {
        setSubscribeTopics(subscribeTopics.filter((_, i) => i !== index)); // Remove the topic at the specified index
    };

    return (
        <div className="mb-8 flex flex-col gap-3">
            <div>
                Publish topic:
                <input 
                    type="text" 
                    className="bg-transparent border rounded-lg mx-2 px-1" 
                    value={publishTopic} 
                    onChange={(e) => setPublishTopic(e.target.value)}
                    style={{
                        width: `${Math.max(publishTopic.length + 1, 10)}ch`,
                        minWidth: '100px'
                    }}
                    placeholder="Type a topic"
                />
                (default topic: 'event/test/frontend/Test')
            </div>
            <div>
                Subscribe topics:
                <button 
                    onClick={addSubscribeTopic} 
                    className="bg-blue-500 text-white rounded px-2 mt-2 mx-2 mb-5"
                    aria-label="Add topic"
                >
                    add topic
                </button>
                <div className="flex gap-2 flex-grow flex-wrap">
                    {subscribeTopics.map((topic, index) => (
                        <div key={index} className="flex items-center">
                            <input 
                                type="text"
                                className="bg-transparent border rounded-lg px-1 flex-grow min-w-[100px]" 
                                value={topic}
                                onChange={(e) => handleSubscribeTopicsChange(index, e.target.value)}
                                style={{
                                    width: `${Math.max(topic.length + 1, 10)}ch`, // minimum width of 10 characters
                                }}
                                placeholder="Type a topic"
                            />
                            <button 
                                onClick={() => removeSubscribeTopic(index)} 
                                className="text-red-500 ml-2"
                                aria-label="Remove topic"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    (default topic: event/testWorker/#)
                </div>
            </div>
        </div>
    )
}

export default TestAppTopics;