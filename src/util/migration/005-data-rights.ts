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

export function runMigration(callback: (success: boolean) => void) {
    createPermissions(beginningPermissions, (permissionSuccess) => {
        callback(permissionSuccess);
    })
}
