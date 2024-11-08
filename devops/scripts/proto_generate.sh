#!/bin/bash

# Read the names of the .proto files from the devops/proto directory
PROTO_FILES=$(ls devops/proto/*.proto)

for FILE in $PROTO_FILES; do
    FILE_NAME=$(basename $FILE)

    #Generate the proto files for the respective languages
    protoc --proto_path=devops/proto --plugin=Nodejs/web-app/node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=Nodejs/web-app/src/protobuf $FILE_NAME
    protoc --proto_path=devops/proto --pyi_out=Python/src/protobuf $FILE_NAME
    protoc --proto_path=devops/proto --python_out=Python/src/protobuf $FILE_NAME
    protoc --proto_path=devops/proto --csharp_out=Dotnet/Dotnet.Protobuf --csharp_opt=base_namespace=Dotnet.Protobuf $FILE_NAME
done

BLUE='\033[0;34m'
# Reset the color
NC='\033[0m' 

# Print blue-colored text
echo "${BLUE}IMPORTANT: Don't forget to update index.ts in the web project (Nodejs/web-app/src/protobuf/index.ts) to include the new modules!${NC}"