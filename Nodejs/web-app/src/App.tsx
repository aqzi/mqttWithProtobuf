import './App.css';
import { MqttProvider } from './mqtt/MqttContext';
import { IClientOptions } from 'mqtt/*';
import PublishMsg from './PublishMsg';
import SubscribeMsg from './SubscribeMsg';

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
    <body className="App">
      <MqttProvider brokerUrl="ws://localhost/mqtt" opts={opts}>
	  	<h1>Demo MQTT application</h1>
        <PublishMsg/>
		<SubscribeMsg/>
      </MqttProvider>
    </body>
  );
}

export default App;
