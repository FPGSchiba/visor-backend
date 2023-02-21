import { IPermission } from '../formats/user.format';
import { createPermissions } from '../database/permissions.database';

const beginningPermissions = [
    {
        name: 'omSimilarity',
        access: {
            path: '/visor/om-similarity',
            method: 'POST'
        },
        roles: [
            'Admin',
            'Contributor',
            'Editor'
        ],
    }
] as IPermission[]

export async function runMigration() {
    let finished = false;
    let success = false;
    createPermissions(beginningPermissions, (permissionSuccess) => {
        success = permissionSuccess;
        finished = true;
    })

    while (!finished) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return success;
}
