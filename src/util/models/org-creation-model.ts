import { CreateTableInput } from "aws-sdk/clients/dynamodb";

export function getOrgCreationModelWithName(tableName: string) {
    return {
        AttributeDefinitions: [
            {
                AttributeName: "orgName",
                AttributeType: "S" //https://dynobase.dev/dynamodb-data-types/
            }
        ],
        KeySchema: [
            {
                AttributeName: "orgName",
                KeyType: "HASH"
            }
        ],
        TableName: tableName
    } as CreateTableInput
}