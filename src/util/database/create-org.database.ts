import { ORG_CREATION_TABLE } from '../config';
import { OrgCreationKeyManager } from '../key-manager';
import { LOG } from '../logger';
import { putItem } from './database';

export function registerNewOrgCreation(orgName: string, requester: string, callback: (success: boolean, creationToken?: string) => void) {
    const creationKey = OrgCreationKeyManager.getCreationKey(orgName, requester);
    const item = {
        activationKey: {S: creationKey} ,
        activated: {B: 'false'},
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
