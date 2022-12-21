import { createTable, getAllTables } from '../database';
import { ORG_CREATION_TABLE } from '../config';
import { getOrgCreationModelWithName } from '../models/org-creation-model';

export function runMigration(callback: (success: boolean) => void) {
    getAllTables(async (tables) => {
        if (!(tables && tables.includes(ORG_CREATION_TABLE))) {
            const table = getOrgCreationModelWithName(ORG_CREATION_TABLE);
            createTable(table, (success) => {
                callback(success);
            });
            //TODO: Add default org: Vanguard but not activated
        }
    })
}
