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

export function getUsersTableModelWithName(tableName: string) {
    return {
        AttributeDefinitions: [
            {
                AttributeName: "token",
                AttributeType: "S"
            }
        ],
        KeySchema: [
            {
                AttributeName: "token",
                KeyType: "HASH"
            }
        ],
        TableName: tableName
    } as CreateTableInput
}

export function getChangesTableModelWithName(tableName: string) {
    return {
        AttributeDefinitions: [
            {
                AttributeName: "id",
                AttributeType: "S"
            }
        ],
        KeySchema: [
            {
                AttributeName: "id",
                KeyType: "HASH"
            }
        ],
        TableName: tableName
    } as CreateTableInput
}