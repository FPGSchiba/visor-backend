import { CreateTableInput } from "aws-sdk/clients/dynamodb";

export function getMigrationsTableModelWithName(tableName: string) {
    return {
        AttributeDefinitions: [
            {
                AttributeName: "id",
                AttributeType: "S"
            },
            {
                AttributeName: "fileName",
                AttributeType: "S" //https://dynobase.dev/dynamodb-data-types/
            }
        ],
        KeySchema: [
            {
                AttributeName: "id",
                KeyType: "HASH"
            },
            {
                AttributeName: "fileName",
                KeyType: "RANGE"
            }
        ],
        TableName: tableName
    } as CreateTableInput
}