import { getReportsTableModelWithName } from '../models/visor-models';
import { createTable, getAllTables } from '../database';
import { REPORT_TABLE_NAME } from '../config';

export function runMigration() {
    getAllTables((tables) => {
        if (!(tables && tables.includes(REPORT_TABLE_NAME))) {
            const table = getReportsTableModelWithName(REPORT_TABLE_NAME);
            createTable(table.TableName, table.KeySchema, table.AttributeDefinitions);
        }
    })
    
}
