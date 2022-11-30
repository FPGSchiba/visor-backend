import { CreateTableInput } from "aws-sdk/clients/dynamodb";

export function getReportsModelWithName(tableName: string) {
    return {
        AttributeDefinitions: [
            {
                AttributeName: "",
                AttributeType: ""
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