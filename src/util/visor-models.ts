import { CreateTableInput } from "aws-sdk/clients/dynamodb";

export function getReportsTableModelWithName(tableName: string) {
    return {
        AttributeDefinitions: [
            {
                AttributeName: "",
                AttributeType: "" //https://dynobase.dev/dynamodb-data-types/
            }
        ],
        KeySchema: [
            {
                AttributeName: "",
                KeyType: ""
            }
        ],
        TableName: tableName
    } as CreateTableInput
}