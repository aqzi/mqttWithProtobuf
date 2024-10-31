# Mqtt with protobuf
This project demonstrates how a dotnet, python and nodejs app can communicate with each other using protobuf messages over MQTT. For each of these 3 applications, I created a service that parses MQTT messages automaticly into the correct object to simplify further processing.

## Quickstart
1. Start mqtt broker using the docker compose
2. Create a proto file in `devops/proto` and afterwards execute the sh file in `devops/scripts` to generate the protobuf files in each of the 3 applications.