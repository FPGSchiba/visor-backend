import { IPermission } from '../formats/user.format';
import { createPermissions } from '../database/permissions.database';

const beginningPermissions = [
    {
        name: 'listSystems',
        access: {
            path: '/data/get-systems',
            method: 'GET'
        },
        roles: [
            'Admin',
            'Contributor',
            'Editor'
        ],
    },
    {
        name: 'getSystem',
        access: {
            path: '/data/get-system',
            method: 'GET'
        },
        roles: [
            'Admin',
            'Contributor',
            'Editor'
        ]
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
