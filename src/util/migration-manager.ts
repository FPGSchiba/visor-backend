import { MIGRATION_DIRECTORY, MIGRATION_TABLE_NAME } from "./config";
import { createTable, getAllTables, putItem, scanTable } from "./database";
import { getMigrationsTableModelWithName } from "./models/migration-model";
import {v4 as uuidv4} from 'uuid';
import * as fs from "fs";
import { LOG } from "./logger";
import { ItemList } from "aws-sdk/clients/dynamodb";

export function runMigration() {
    createMigrationTable();
    const migrationFiles = fs.readdirSync(MIGRATION_DIRECTORY.replace('.', 'src/util'));
    scanTable(MIGRATION_TABLE_NAME, async (data) => {
        const doneMigrations = data.Items;
        const migrated = await Promise.all(migrationFiles.map(async (file) => {
            if (!didRunMigration(file, doneMigrations)) {
                const module = await import(`${MIGRATION_DIRECTORY}${file}`);
                module.runMigration()
                return file;
            }
        }));
        LOG.info(`Successful migration for: [${migrated}]`);
        migrated.forEach((value) => {
            if (value) {
                const item = {
                    id: {S: uuidv4()} ,
                    fileName: {S: value},
                    date: {S: Date()}
                }
                putItem(MIGRATION_TABLE_NAME, item);
            }
        })
    })
}

function didRunMigration(file: string, doneMigrations: ItemList | undefined): boolean {
    if (doneMigrations) {
        const items = doneMigrations.map((value) => {
            if (value.fileName.S == file) {
                return true;
            }
            return false;
        })

        return items.includes(true);
    }
    return false;
}

function createMigrationTable() {
    getAllTables((tables) => {
        if (!(tables && tables.includes(MIGRATION_TABLE_NAME))) {
            const table = getMigrationsTableModelWithName(MIGRATION_TABLE_NAME);
            createTable(table.TableName, table.KeySchema, table.AttributeDefinitions);
        }
    })
}