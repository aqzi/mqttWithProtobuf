import { Test } from "../protobuf/Test";
import useSubscription from "../mqtt/UseSubscription";

const SubscribeMsg = () => {
    const {message} = useSubscription('event/testWorker/#');

    if (!message) return null;

    const payload = message.payload as Test;
    
    return (
        <div className="mt-20">
            <p>Received Message: {payload.msg}</p>
            <p>Timestamp: {payload.timestamp?.toString()}</p>
        </div>
    )
}

export default SubscribeMsg;