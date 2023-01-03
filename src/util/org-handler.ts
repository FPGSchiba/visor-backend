import { TABLE_EXTENSION_CHANGES, TABLE_EXTENSION_REPORTS, TABLE_EXTENSION_USERS } from "./config";
import { activateOrgRecord, deleteNotActiveOrg, getOrgInfo } from "./database/create-org.database";
import { createTable, deleteTable } from "./database/database";
import { createUser } from "./database/org-users.database";
import { LOG } from "./logger";
import { getChangesTableModelWithName, getReportsTableModelWithName, getUsersTableModelWithName } from "./models/visor-models";

export async function activateOrg(activationToken: string, callback: (success: boolean, message: string, token?: {orgToken: string, userToken: string}) => void) {
    // Get Org Info
    await getOrgInfo(activationToken, async (success, data) => {
        if (success && data) {
            const { orgName, requester } = data;
            // Create Tables
            const userTableName = `${orgName.toLowerCase()}${TABLE_EXTENSION_USERS}`;
            const changesTableName = `${orgName.toLowerCase()}${TABLE_EXTENSION_CHANGES}`;
            const reportsTableName = `${orgName.toLowerCase()}${TABLE_EXTENSION_REPORTS}`;
            
            const userTable = getUsersTableModelWithName(userTableName);
            const changesTable = getChangesTableModelWithName(changesTableName);
            const reportsTable = getReportsTableModelWithName(reportsTableName);
            let doneCount = 0;
            await Promise.all(
                [
                    createTable(userTable, (success) => {!success ? LOG.warn(`Table: "${userTableName}" for Org already exists.`) && doneCount++ : doneCount++;}),
                    createTable(changesTable, (success) => {!success ? LOG.warn(`Table: "${changesTableName}" for Org already exists.`) && doneCount++ : doneCount++;}),
                    createTable(reportsTable, (success) => {!success ? LOG.warn(`Table: "${reportsTableName}" for Org already exists.`) && doneCount++ : doneCount++;})
                ]
            );
            // Wait for table creation to finish
            while (doneCount < 3) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            // Create default User
            createUser(orgName, requester, 'Admin', (success, token) => {
                if (success) {
                    // Activate in DB
                    activateOrgRecord(orgName, (success, orgToken) => {
                        if (success) {
                            // Return User Info
                            const returnData = {
                                orgToken: orgToken || '',
                                userToken: token ||''
                            }
                            callback(true, 'Successfully activated Org! Please use the given userToken to authenticate with VISOR.', returnData);
                        } else {
                            callback(false, 'Could not activate Org :( Please check the Logs, this was a bug inside VISOR please report this to: FPGSchiba!');
                        }
                    });
                } else {
                    callback(success, 'Could not create default User, please try again.');
                }
            });
        } else {
            callback(false, 'Activation Key was not found.');
        }
    })
}

export async function deleteEntireOrg(orgName: string, callback: (success: boolean, message: string) => void) {
    const userTableName = `${orgName.toLowerCase()}-users-table`;
    const changesTableName = `${orgName.toLowerCase()}-changes-table`;
    const reportsTableName = `${orgName.toLowerCase()}-reports-table`;
    let doneCount = 0;

    await Promise.all(
        [
            deleteTable(userTableName, (success) => {!success ? LOG.warn(`Table: "${userTableName}" does not exist.`) && doneCount++ : doneCount++;}),
            deleteTable(changesTableName, (success) => {!success ? LOG.warn(`Table: "${changesTableName}" does not exist.`) && doneCount++ : doneCount++;}),
            deleteTable(reportsTableName, (success) => {!success ? LOG.warn(`Table: "${reportsTableName}" does not exist.`) && doneCount++ : doneCount++;})
        ]
    );
    
    while (doneCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    deleteNotActiveOrg(orgName, (success) => {
        if (success) {
            callback(true, `Successfully deleted the entire Org: ${orgName}`);
        } else {
            callback(false, `Could not delete Org: ${orgName}, please report this to FPGSchiba. There is likely something wrong with VISOR :D`);
        }
    })

}