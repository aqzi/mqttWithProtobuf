import { useState } from "react";
import PublishMsg from "./PublishMsg";

const Settings = () => {
    const [publishTopic, setPublishTopic] = useState<string>('event/test/frontend/Test');
    
    return (
        <div className="bg-[#272931] p-4">
            <div className='flex flex-col border rounded-lg text-xl text-left p-4 mb-10'>
                <h2 className='text-4xl'>Topic info</h2>
                <div className='flex flex-col'>
                    <h3 className='mt-5 text-2xl'>.Net:</h3>
                    <ul>
                        <li>- MsgClass: Test, SubscribeTopic: event/test/#, PublishTopic: event/testDotnet/dotnet/Test</li>
                    </ul>
                </div>
                <div className='flex flex-col'>
                    <h3 className='mt-5 text-2xl'>Python:</h3>
                    <ul>
                        <li>- MsgClass: Test, SubscribeTopic: event/test/#, PublishTopic: event/testPython/python/Test</li>
                    </ul>
                </div>
                <div className='flex flex-col'>
                    <h3 className='mt-5 text-2xl'>NodeJs:</h3>
                    <ul>
                        <li>- MsgClass: Test, SubscribeTopic: [event/testDotnet/#, event/testPython/#], PublishTopic: {publishTopic}</li>
                    </ul>
                </div>
            </div>
            <div className='flex flex-col text-xl text-left'>
					<h2 className='text-4xl mb-8'>Publish message</h2>
					<PublishMsg cb={(topic) => setPublishTopic(topic)}/>
            </div>
        </div>
    );
}

export default Settings;