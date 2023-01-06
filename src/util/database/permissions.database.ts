import { ScanInput } from "aws-sdk/clients/dynamodb";
import { PERMISSIONS_TABLE_NAME } from "../config";
import { IAccess, IPermission } from "../formats/user.format";
import { LOG } from "../logger";
import { filterTable, putItem } from "./database";

export function createPermissions(permissions: IPermission[], callback: (success: boolean) => void) {
    permissions.map((value) => {
        const item = {
            name: {S: value.name},
            access: {
                M: {
                    method: { S: value.access.method },
                    path: {S: value.access.path}
                }
            },
            roles: {SS: value.roles}
        }
        putItem(PERMISSIONS_TABLE_NAME, item, (err) => {
            if (err) {
                LOG.error(err.message);
                callback(false);
            }
        })
    });
    callback(true);
}

export function roleAccessValidation(role: string, access: IAccess, callback: (success: boolean, result?: boolean) => void) {
    const query = {
        "TableName": PERMISSIONS_TABLE_NAME,
        "ConsistentRead": false,
        "FilterExpression": "#d8850 = :d8850",
        "ExpressionAttributeValues": {
            ":d8850": {
                "M": {
                    "method": {"S": access.method},
                    "path": {"S": access.path}
                }
            },
        },
        "ExpressionAttributeNames": {
            "#d8850": "access"
        }
    } as ScanInput
    filterTable(query, (success, data) => {
        if (success && data?.Items && data.Items.length == 1) {
            callback(true, data.Items[0].roles.SS?.includes(role));
        } else {
            callback(false);
        }
    })
}