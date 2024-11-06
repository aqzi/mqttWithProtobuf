import './App.css';
import Settings from './components/Settings';
import SubscribeMsg from './components/SubscribeMsg';
import { MqttProvider } from './mqtt/MqttContext';
import { IClientOptions } from 'mqtt/*';

const App = () => {
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
				<div className='flex flex-col text-xl text-left w-4/5'>
					<Settings/>
					<SubscribeMsg/>
				</div>
			</MqttProvider>
		</body>
	);
}

export default App;
