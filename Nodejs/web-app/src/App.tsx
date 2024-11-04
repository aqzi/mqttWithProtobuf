import './App.css';
import { MqttProvider } from './mqtt/MqttContext';
import { IClientOptions } from 'mqtt/*';
import PublishMsg from './components/PublishMsg';
import SubscribeMsg from './components/SubscribeMsg';
import TestAppTopics from './components/TestAppTopics';
import MqttMessage from './components/MqttMessage';

function App() {
  const opts: IClientOptions = {
		clientId: "frontend",
		username: "frontend",
		password: "password",
		reconnectPeriod: 1000,
		keepalive: 5,
		rejectUnauthorized: false,
		protocolVersion: 5,
		port: 8080,
	};
  
  return (
    <body className="App flex flex-col items-center">
      <MqttProvider brokerUrl="ws://localhost/mqtt" opts={opts}>
	  	<h1 className='text-5xl mb-20'>Demo MQTT application</h1>
		<div className='flex flex-col border rounded-lg text-xl text-left p-4 mb-20 w-4/5'>
			<h2 className='text-3xl underline'>Backend topic info</h2>
			<div className='flex flex-col'>
				<h3 className='mt-5 text-2xl'>.Net:</h3>
				<ul>
					<li>- MsgHandler: TestHandler, MsgClass: Test, SubscribeTopic: event/test/#, PublishTopic: event/testWorker/worker/Test</li>
				</ul>
			</div>
			<div className='flex flex-col'>
				<h3 className='mt-5 text-2xl'>Python:</h3>
				<ul>
					<li>- MsgHandler: TestHandler, MsgClass: Test, PublishTopic: ..., SubscribeTopic: ...</li>
				</ul>
			</div>
		</div>
		<div className='flex flex-col text-xl text-left p-4 w-4/5'>
			<h2 className='text-4xl mb-8'>Mqtt test app</h2>
			<div className='bg-[#272931] p-4'>
				<div className='mb-10'>
					<TestAppTopics/>
					<MqttMessage/>
				</div>
				<PublishMsg/>
			</div>
			
			<SubscribeMsg/>
		</div>
      </MqttProvider>
    </body>
  );
}

export default App;
