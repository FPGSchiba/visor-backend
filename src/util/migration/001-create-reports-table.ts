import { getReportsTableModelWithName } from '../models/visor-models';
import { createTable, getAllTables } from '../database/database';
import { REPORT_TABLE_NAME } from '../config';

export async function runMigration(): Promise<boolean> {
    let finished = false;
    let success = false;
    getAllTables(async (tables) => {
        if (!(tables && tables.includes(REPORT_TABLE_NAME))) {
            const table = getReportsTableModelWithName(REPORT_TABLE_NAME);
            createTable(table, (success) => {
                success = success;
                finished = true;
            });
        } else {
            finished = true;
        }
    })

    while (!finished) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return success;
}
