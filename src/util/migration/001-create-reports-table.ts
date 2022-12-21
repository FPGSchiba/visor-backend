import { getReportsTableModelWithName } from '../models/visor-models';
import { createTable, getAllTables } from '../database';
import { REPORT_TABLE_NAME } from '../config';

export function runMigration(callback: (success: boolean) => void) {
    getAllTables(async (tables) => {
        if (!(tables && tables.includes(REPORT_TABLE_NAME))) {
            const table = getReportsTableModelWithName(REPORT_TABLE_NAME);
            createTable(table, (success) => {
                callback(success);
            });
        }
    })
    
}
