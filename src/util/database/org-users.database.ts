import { TABLE_EXTENSION_USERS } from "../config";
import { UserKeyManager } from "../key-manager";
import { LOG } from "../logger";
import { filterTable, putItem } from "./database";

function getTableName(orgName: string): string {
    return `${orgName.toLowerCase()}${TABLE_EXTENSION_USERS}`;
}

export function createUser(orgName: string, handle: string, role: string, callback: (success: boolean, token?: string) => void) {
    const orgTable = getTableName(orgName);
    const userToken = UserKeyManager.getUserKey(handle);
    const item = {
        token: { S: userToken },
        handle: { S: handle },
        role: { S: role }
    }
    putItem(orgTable, item, (err) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true, userToken);
        }
    })
}

export function getUserFromKey(userKey: string, orgName: string, callback: (success: boolean, data?: { handle: string, role: string }) => void) {
    const orgTable = getTableName(orgName);
    const query = {
        "TableName": orgTable,
        "ConsistentRead": false,
        "FilterExpression": "#d8850 = :d8850",
        "ExpressionAttributeValues": {
            ":d8850": {
                "S": userKey
            },
        },
        "ExpressionAttributeNames": {
            "#d8850": "token"
        }
    }
    filterTable(query, (success, data) => {
        if(success) {
            if (data?.Items?.length == 1) {
                const result = data?.Items[0];
                const returnData = {
                    role: result.role.S || '',
                    handle: result.handle.S || '',
                }
                callback(true, returnData);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    })
}