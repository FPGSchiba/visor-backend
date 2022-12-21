import { CreateTableInput } from "aws-sdk/clients/dynamodb";

export function getOrgCreationModelWithName(tableName: string) {
    return {
        AttributeDefinitions: [
            {
                AttributeName: "activationKey",
                AttributeType: "S"
            },
            {
                AttributeName: "activated",
                AttributeType: "B" //https://dynobase.dev/dynamodb-data-types/
            }
        ],
        KeySchema: [
            {
                AttributeName: "activationKey",
                KeyType: "HASH"
            },
            {
                AttributeName: "activated",
                KeyType: "RANGE"
            }
        ],
        TableName: tableName
    } as CreateTableInput
}