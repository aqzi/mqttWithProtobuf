#!/bin/bash

# Create an index.ts file to export the generated modules in the web project
INDEX_TS_FILE="Nodejs/web-app/protobuf/index.ts"
echo "// Auto-generated barrel file" > ${INDEX_TS_FILE}

# Read the names of the .proto files from the devops/proto directory
PROTO_FILES=$(ls devops/proto/*.proto)

for FILE in $PROTO_FILES; do
    FILE_NAME=$(basename $FILE)
    MODULE_NAME="${FILE_NAME%.proto}"

    echo "import * as ${MODULE_NAME} from './${MODULE_NAME}';" >> ${INDEX_TS_FILE}

    #Generate the proto files for the respective languages
    protoc --proto_path=devops/proto --plugin=Nodejs/web-app/node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=Nodejs/web-app/protobuf $FILE_NAME
    protoc --proto_path=devops/proto --pyi_out=Python/protobuf $FILE_NAME
    protoc --proto_path=devops/proto --python_out=Python/protobuf $FILE_NAME
    protoc --proto_path=devops/proto --csharp_out=Dotnet/Dotnet.Protobuf --csharp_opt=base_namespace=Dotnet.Protobuf $FILE_NAME
done

# Create an object to organize the exports
echo "\n" >> ${INDEX_TS_FILE}
echo "export const Components = {" >> ${INDEX_TS_FILE}

for FILE in $PROTO_FILES; do
    FILE_NAME=$(basename $FILE)
    MODULE_NAME="${FILE_NAME%.proto}"

    echo "\t${MODULE_NAME}," >> ${INDEX_TS_FILE}
done

# Close the Components object and export it
echo "};" >> ${INDEX_TS_FILE}