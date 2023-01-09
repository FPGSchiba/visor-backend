import { TABLE_EXTENSION_REPORTS } from "../config";

// TODO: Implement create and delete needed Table
function getTableName(orgName: string): string {
    return `${orgName.toLowerCase()}${TABLE_EXTENSION_REPORTS}`;
}

