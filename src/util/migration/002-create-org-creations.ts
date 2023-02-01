import { createTable, getAllTables } from '../database/database';
import { DEFAULT_ORG_NAME, DEFAULT_ORG_REQUESTER, ORG_CREATION_TABLE } from '../config';
import { getOrgCreationModelWithName } from '../models/org-creation-model';
import { registerNewOrgCreation } from '../database/create-org.database';

export async function runMigration() {
    let success = false;
    let finished = false;
    getAllTables((tables) => {
        if (!(tables && tables.includes(ORG_CREATION_TABLE))) {
            const table = getOrgCreationModelWithName(ORG_CREATION_TABLE);
            createTable(table, (tableSuccess) => {
                if (tableSuccess) {
                    registerNewOrgCreation(DEFAULT_ORG_NAME, DEFAULT_ORG_REQUESTER, (successful) => {
                        success = successful;
                        finished = true;
                    });
                } else {
                    success = tableSuccess;
                    finished = true;
                }
            });
        } else {
            registerNewOrgCreation(DEFAULT_ORG_NAME, DEFAULT_ORG_REQUESTER, (creationSuccess) => {
                success = creationSuccess;
                finished = true;
            });
        }
    })

    while (!finished) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return success;
}
