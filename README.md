# Mqtt with protobuf
This project demonstrates how a dotnet, python and nodejs app can communicate with each other using protobuf messages over MQTT. For each of these 3 applications, I created a service that parses MQTT messages automaticly into the correct object to simplify further processing.

![Demo mqtt application](Nodejs/web-app//public//demoScreenshot.png)

## 🔥 Quickstart
1. Start mqtt broker using the docker compose.
2. Execute the sh file in `devops/scripts` to generate the protobuf files in each of the 3 applications. Be aware that you also have to create an index.ts file inside `Nodejs/web-app/src/protobuf`! This can be done as follow:
```typescript
import { Test, User } from './Test'; //extend when adding more messages inside the Test.proto file
//add additional imports when creating new proto files

export const Components = {
	Test,
	User
};
```
3. Go to Python project, create virtual env, install the packages with `pip install -r requirements` and run the code with `python Python/src/main.py`.
4. Go to Dotnet project and run app with command `dotnet run`
5. Go to Nodejs project, install packages with `npm install` and run the code with `npm start`.
6. Go to `http://localhost:3000/` to view the demo mqtt application.

## 🧑‍💻 Debugging
You can debug each project. The settings are located in the .vscode directory. Make sure to adjust the 'python' property in case your virtual env is not located under the Python directory.

## ✅ TODO
- update the proto_generate.sh file such that it generates the index.ts file inside Nodejs/web-app/src/protobuf
- make the mqtt service in all projects async
- make a docker file for each project
- create an sh file to start all projects at once
- bug fix: nodejs app sometimes disconnects with the mqtt broker at start (temporary fix: refresh the page until it works)