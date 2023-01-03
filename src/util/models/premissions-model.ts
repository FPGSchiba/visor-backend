import { CreateTableInput } from "aws-sdk/clients/dynamodb";

export function getPermissionsTableFromName(tableName: string) {
    return {
        AttributeDefinitions: [
            {
                AttributeName: "name",
                AttributeType: "S" //https://dynobase.dev/dynamodb-data-types/
            }
        ],
        KeySchema: [
            {
                AttributeName: "name",
                KeyType: "HASH"
            }
        ],
        TableName: tableName
    } as CreateTableInput
}