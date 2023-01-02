// TODO: Implement create and delete needed Table

import { UserKeyManager } from "../key-manager";
import { LOG } from "../logger";
import { putItem } from "./database";

export function createUser(orgName: string, handle: string, role: string, callback: (success: boolean, token?: string) => void) {
    const orgTable = `${orgName.toLowerCase()}-users-table`;
    const userToken = UserKeyManager.getUserKey(handle);
    const item = {
        token: { S: userToken },
        handle: { S: handle },
        role: { S: role }
    }
    putItem(orgTable, item, (err) => {
        if (err) {
            LOG.error(err.message);
            callback(false);
        } else {
            callback(true, userToken);
        }
    })
}