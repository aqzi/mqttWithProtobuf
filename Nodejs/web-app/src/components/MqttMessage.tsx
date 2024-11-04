import { useState } from "react";
import { Test } from "../protobuf/Test";

const MqttMessage = () => {
    const [message, setMessage] = useState<Test>({timestamp: new Date(), msg: ''});
    
    return (
        <div>
            <h1 className="text-2xl mb-2 font-bold">MqttMessage:</h1>
            Message: 
            <input 
                type="text" 
                className="bg-transparent border rounded-lg mx-2 px-1" 
                value={message.msg} 
                onChange={(e) => setMessage({
                    timestamp: new Date(),
                    msg: e.target.value
                })}
                style={{
                    width: `${Math.max(message.msg.length + 1, 10)}ch`,
                    minWidth: '200px'
                }}
                placeholder="Type your message"
            />
            (default msg: 'Hello from the frontend!')
        </div>
    )
}

export default MqttMessage