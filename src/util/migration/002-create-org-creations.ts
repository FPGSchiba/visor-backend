import { createTable, getAllTables } from '../database/database';
import { DEFAULT_ORG_NAME, DEFAULT_ORG_REQUESTER, ORG_CREATION_TABLE } from '../config';
import { getOrgCreationModelWithName } from '../models/org-creation-model';
import { registerNewOrgCreation } from '../database/create-org.database';

export function runMigration(callback: (success: boolean) => void) {
    getAllTables((tables) => {
        if (!(tables && tables.includes(ORG_CREATION_TABLE))) {
            const table = getOrgCreationModelWithName(ORG_CREATION_TABLE);
            createTable(table, (success) => {
                if (success) {
                    registerNewOrgCreation(DEFAULT_ORG_NAME, DEFAULT_ORG_REQUESTER, (successful) => {
                        callback(successful);
                    });
                } else {
                    callback(success);
                }
            });
        } else {
            registerNewOrgCreation(DEFAULT_ORG_NAME, DEFAULT_ORG_REQUESTER, (success) => {
                callback(success);
            });
        }
    })
}
