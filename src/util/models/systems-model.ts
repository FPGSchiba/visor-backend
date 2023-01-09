import { CreateTableInput } from "aws-sdk/clients/dynamodb";

export function getSystemsTableFromName(tableName: string) { // Solar systems
    return {
        AttributeDefinitions: [
            {
                AttributeName: "id",
                AttributeType: "S" //https://dynobase.dev/dynamodb-data-types/
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

export function getStellarObjectsTableFromName(tableName: string) { // Planets and Nebulas
    return {
        AttributeDefinitions: [
            {
                AttributeName: "id",
                AttributeType: "S" //https://dynobase.dev/dynamodb-data-types/
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

export function getPlanetLevelObjectsTableFromName(tableName: string) { // Moons and stations on Planets
    return {
        AttributeDefinitions: [
            {
                AttributeName: "id",
                AttributeType: "S" //https://dynobase.dev/dynamodb-data-types/
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

export function getMoonLevelObjectsTableFromName(tableName: string) { // stations on Moons
    return {
        AttributeDefinitions: [
            {
                AttributeName: "id",
                AttributeType: "S" //https://dynobase.dev/dynamodb-data-types/
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