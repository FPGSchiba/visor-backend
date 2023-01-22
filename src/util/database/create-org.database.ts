import { DynamoDB } from 'aws-sdk';
import { AttributeUpdates, QueryInput } from 'aws-sdk/clients/dynamodb';
import { ORG_CREATION_TABLE } from '../config';
import { OrgCreationKeyManager, OrgKeyManager } from '../key-manager';
import { LOG } from '../logger';
import { deleteItem, filterTable, getItemFromTable, putItem, queryTable, scanTable, updateItem } from './database';

export interface IOrgInfo {
    orgName: string,
    activated: boolean,
    requester: string,
    creationDate: Date,
}

export function registerNewOrgCreation(orgName: string, requester: string, callback: (success: boolean, creationToken?: string) => void) {
    const creationKey = OrgCreationKeyManager.getCreationKey(orgName, requester);
    const orgKey = OrgKeyManager.getOrgKey(orgName);
    const item = {
        activationKey: {S: creationKey},
        activated: {BOOL: false},
        orgName: {S: orgName},
        orgKey: {S: orgKey},
        requester: {S: requester},
        creationDate: {S: Date()}
    }
    putItem(ORG_CREATION_TABLE, item, (err) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true, creationKey);
        }
    });
}

export function fetchActivationToken(orgName: string, callback: (success: boolean, token?: string) => void) {
    const key = {
        orgName: {S: orgName}
    }
    getItemFromTable(ORG_CREATION_TABLE, key, (success, data) => {
        if (success) {
            console.log(data);
            if (data?.Item) callback(true, data.Item.activationKey.S);
            else {
                LOG.error(`OrgName: ${orgName} was not found in activation Table!`);
                callback(false)
            }
        } else {
            callback(false);
        }
    })
}

export function getAllOrgs(callback: (success: boolean, data?: IOrgInfo[]) => void) {
    scanTable(ORG_CREATION_TABLE, (data) => {
        if (data.Items) {
            const transformedData = data.Items.map((value) => {
                return {
                    requester: value.requester.S,
                    orgName: value.orgName.S,
                    creationDate: new Date(value.creationDate.S || Date()),
                    activated: value.activated.BOOL,
                } as IOrgInfo
            })
            callback(true, transformedData);
        } else {
            callback(false);
        }
    })
}

export function deleteNotActiveOrg(orgName: string, callback: (success: boolean) => void) {
    const key = {
        orgName: {S: orgName}
    }
    deleteItem(ORG_CREATION_TABLE, key, (success) => {
        callback(success);
    })
}

export function getOrgInfo(activationKey: string, callback: (success: boolean, data?: {orgName: string, requester: string}) => void) {
    const query = {
        "TableName": ORG_CREATION_TABLE,
        "ConsistentRead": false,
        "FilterExpression": "#d8850 = :d8850 and #d8851 = :d8851",
        "ExpressionAttributeValues": {
            ":d8850": {
                "S": activationKey
            },
            ":d8851": {
                "BOOL": false
            }
        },
        "ExpressionAttributeNames": {
            "#d8850": "activationKey",
            "#d8851": "activated"
        }
    }
    filterTable(query, (success, data) => {
        if(success) {
            if (data?.Items?.length == 1) {
                const result = data?.Items[0];
                const returnData = {
                    orgName: result.orgName.S ||'',
                    requester: result.requester.S||'',
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

export function activateOrgRecord(orgName: string, callback: (success: boolean, orgToken?: string) => void) {
    const key = {
        orgName: {S: orgName}
    }
    const updates = {
        activated: {
            Value: { BOOL: true}
        }
    } as AttributeUpdates

    updateItem(ORG_CREATION_TABLE, key, updates, (updateSuccess) => {
        if (updateSuccess) {
            getItemFromTable(ORG_CREATION_TABLE, key, (getSuccess, data) => {
                if (getSuccess && data?.Item) {
                    callback(true, data.Item.orgKey.S);
                } else {
                    callback(false);
                }
            })
        } else {
            callback(false);
        }
    });
}

export function getOrgNameFromKey(orgKey: string, callback: (success: boolean, orgName?: string) => void) {
    const query = {
        "TableName": ORG_CREATION_TABLE,
        "ConsistentRead": false,
        "FilterExpression": "#d8850 = :d8850 and #d8851 = :d8851",
        "ExpressionAttributeValues": {
            ":d8850": {
                "S": orgKey
            },
            ":d8851": {
                "BOOL": true
            }
        },
        "ExpressionAttributeNames": {
            "#d8850": "orgKey",
            "#d8851": "activated"
        }
    }
    filterTable(query, (success, data) => {
        if(success && data && data.Items && data.Items.length == 1) {
            const result = data?.Items[0];
            callback(true, result.orgName.S);
        } else {
            callback(false);
        }
    })
}
