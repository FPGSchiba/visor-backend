import { MIGRATION_DIRECTORY, MIGRATION_TABLE_NAME } from "./config";
import { createTable, getAllTables, putItem, scanTable } from "./database/database";
import { getMigrationsTableModelWithName } from "./models/migration-model";
import {v4 as uuidv4} from 'uuid';
import * as fs from "fs";
import { LOG } from "./logger";
import { ItemList } from "aws-sdk/clients/dynamodb";

export function runMigration() {
    createMigrationTable((success) => {
        const migrationFiles = fs.readdirSync(MIGRATION_DIRECTORY.replace('.', 'src/util'));
        scanTable(MIGRATION_TABLE_NAME, async (data) => {
            const doneMigrations = data.Items;
            migrationFiles.map(async (file) => {
                if (!didRunMigration(file, doneMigrations)) {
                    const module = await import(`${MIGRATION_DIRECTORY}${file}`);
                    module.runMigration((success: boolean) => {
                        if (success) {
                            LOG.info(`Successful migration for: [${file}]`);
                            const item = {
                                id: {S: uuidv4()} ,
                                fileName: {S: file},
                                date: {S: Date()}
                            }
                            putItem(MIGRATION_TABLE_NAME, item, (err) => {
                                if (err) {
                                    LOG.error(err.message);
                                }
                            });
                        }
                    });
                }
            });
        });
    });
}

function didRunMigration(file: string, doneMigrations: ItemList | undefined): boolean {
    if (doneMigrations) {
        const items = doneMigrations.filter((value) => value.fileName.S == file);
        if (items.length == 1) {
            return true;
        } else {
            return false;
        }
    }
    return false;
}

function createMigrationTable(callback: (success: boolean) => void) {
    getAllTables((tables) => {
        if (!(tables && tables.includes(MIGRATION_TABLE_NAME))) {
            const table = getMigrationsTableModelWithName(MIGRATION_TABLE_NAME);
            createTable(table, (success) => {
                callback(success);
            });
        } else {
            callback(true);
        }
    })
}