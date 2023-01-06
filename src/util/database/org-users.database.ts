import { TABLE_EXTENSION_USERS } from "../config";
import { IUser } from "../formats/user.format";
import { UserKeyManager } from "../key-manager";
import { LOG } from "../logger";
import { deleteItem, filterTable, getItemFromTable, putItem, scanTable, updateItem } from "./database";

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
    const key = {
        token: {S: userKey}
    }
    getItemFromTable(orgTable, key, (success, data) => {
        if(success) {
            if (data?.Item) {
                const result = data?.Item;
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

export function getAllUsers(orgName: string, query: {length?: string, from?: string, to?: string}, callback: (success: boolean, data?: {users: IUser[], count: number}) => void) {
    const orgTable = getTableName(orgName);
    scanTable(orgTable, (data) => {
        if (data.Count && data.Count >= 0 && data.Items) {
            if (query.length && !query.from && !query.to) {
                const length = Number(query.length);
                if (data.Count >= length) {
                    const returnData ={
                        users: data.Items.slice(0, length - 1).map((value) => {
                            return {
                                handle: value.handle.S || '',
                                role: value.role.S || '',
                                token: value.token.S || '',
                            }
                        }),
                        count: data.Count
                    }
                    callback(true, returnData);
                } else {
                    const returnData = {
                        users: data.Items?.map((value) => {
                            return {
                                handle: value.handle.S || '',
                                role: value.role.S || '',
                                token: value.token.S || '',
                            }
                        }),
                        count: data.Count,
                    }
                    callback(true, returnData);
                }
                
            } else if (query.length && query.from && query.to) {
                const length = Number(query.length);
                const from = Number(query.from);
                const to = Number(query.to);

                if (data.Count >= length || data.Count > to) {
                    if(data.Count >= from && data.Count >= to && from < to && (to - from) <= length) {
                        const returnData = {
                            users: data.Items.slice(from, to).map((value) => {
                                return {
                                    handle: value.handle.S || '',
                                    role: value.role.S || '',
                                    token: value.token.S || '',
                                }
                            }),
                            count: data.Count
                        }
                        callback(true, returnData);
                    } else {
                        const returnData ={
                            users: data.Items.slice(0, length - 1).map((value) => {
                                return {
                                    handle: value.handle.S || '',
                                    role: value.role.S || '',
                                    token: value.token.S || '',
                                }
                            }),
                            count: data.Count
                        }
                        callback(true, returnData);
                    }
                    
                } else {
                    const returnData = {
                        users: data.Items?.map((value) => {
                            return {
                                handle: value.handle.S || '',
                                role: value.role.S || '',
                                token: value.token.S || '',
                            }
                        }),
                        count: data.Count,
                    }
                    callback(true, returnData);
                }
            } else {
                const returnData = {
                    users: data.Items?.map((value) => {
                        return {
                            handle: value.handle.S || '',
                            role: value.role.S || '',
                            token: value.token.S || '',
                        }
                    }),
                    count: data.Count,
                }
                callback(true, returnData);
            }
        } else {
            callback(false);
        }
    })
}

export function getUserFromHandle(orgName: string, handle: string, callback: (success: boolean, user?: IUser) => void) {
    const orgTable = getTableName(orgName);
    const query = {
        "TableName": orgTable,
        "ConsistentRead": false,
        "FilterExpression": "#d8850 = :d8850",
        "ExpressionAttributeValues": {
            ":d8850": {
                "S": handle
            },
        },
        "ExpressionAttributeNames": {
            "#d8850": "handle"
        }
    }
    filterTable(query, (success, data) => {
        if(success) {
            if (data?.Items?.length == 1) {
                const result = data?.Items[0];
                const returnData = {
                    role: result.role.S || '',
                    handle,
                    token: result.token.S || '',
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

export function updateUser(orgName: string, userKey: string, newRole: string, callback: (success: boolean) => void) {
    const orgTable = getTableName(orgName);
    const key = {
        token: {S: userKey}
    }
    const updates = {
        role: {
            Value: {S: newRole}
        }
    }
    if (newRole == 'Admin' || newRole == 'Editor' || newRole == 'Contributor') {
        updateItem(orgTable, key, updates, (success) => {
            callback(success);
        })
    } else {
        callback(false);
    }
}

export function deleteUser(orgName: string, userKey: string, callback: (success: boolean) => void) {
    const orgTable = getTableName(orgName);
    const key = {
        token: {S: userKey}
    }
    deleteItem(orgTable, key, (success) => {
        callback(success);
    })
}