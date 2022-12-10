import { CreateTableInput } from "aws-sdk/clients/dynamodb";

export function getReportsTableModelWithName(tableName: string) {
    return {
        AttributeDefinitions: [
            {
                AttributeName: "id",
                AttributeType: "S"
            },
            {
                AttributeName: "name",
                AttributeType: "S" //https://dynobase.dev/dynamodb-data-types/
            }
        ],
        KeySchema: [
            {
                AttributeName: "id",
                KeyType: "HASH"
            },
            {
                AttributeName: "name",
                KeyType: "RANGE"
            }
        ],
        TableName: tableName
    } as CreateTableInput
}