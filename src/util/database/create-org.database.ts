import { ORG_CREATION_TABLE } from '../config';
import { OrgCreationKeyManager } from '../key-manager';
import { LOG } from '../logger';
import { deleteItem, getItemFromTable, putItem, scanTable } from './database';

export interface IOrgInfo {
    orgName: string,
    activated: boolean,
    requester: string,
    creationDate: Date,
}

export function registerNewOrgCreation(orgName: string, requester: string, callback: (success: boolean, creationToken?: string) => void) {
    const creationKey = OrgCreationKeyManager.getCreationKey(orgName, requester);
    const item = {
        activationKey: {S: creationKey} ,
        activated: {BOOL: false},
        orgName: {S: orgName},
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