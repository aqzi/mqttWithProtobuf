import './App.css';
import Settings from './components/Settings';
import SubscribeMsg from './components/SubscribeMsg';
import { MqttProvider } from './mqtt/MqttContext';
import { IClientOptions } from 'mqtt/*';

const App = () => {
	const opts: IClientOptions = {
			clientId: process.env.REACT_APP_MQTT_CLIENT_ID,
			username: process.env.REACT_APP_MQTT_USER,
			password: process.env.REACT_APP_MQTT_PASSWORD,
			reconnectPeriod: parseInt(process.env.REACT_APP_MQTT_RECONNECT_PERIOD!, 10),
			keepalive: parseInt(process.env.REACT_APP_MQTT_KEEP_ALIVE!, 10),
			rejectUnauthorized: Boolean(process.env.REACT_APP_MQTT_IS_TLS_ENABLED),
			protocolVersion: parseInt(process.env.REACT_APP_MQTT_PROTOCOL_VERSION!, 10) as 3 | 4 | 5,
			port: parseInt(process.env.REACT_APP_MQTT_PORT!, 10),
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
