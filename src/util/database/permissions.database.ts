import { PERMISSIONS_TABLE_NAME } from "../config";
import { IPermission } from "../formats/user.format";
import { LOG } from "../logger";
import { putItem } from "./database";

export function createPermissions(permissions: IPermission[], callback: (success: boolean) => void) {
    permissions.map((value) => {
        const item = {
            name: {S: value.name},
            access: {Map: value.access},
            roles: {SS: value.roles}
        }
        putItem(PERMISSIONS_TABLE_NAME, item, (err) => {
            if (err) {
                LOG.error(err.message);
                callback(false);
            }
        })
    });
    callback(true);
}