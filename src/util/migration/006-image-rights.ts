import { IPermission } from '../formats/user.format';
import { createPermissions } from '../database/permissions.database';

const beginningPermissions = [
    {
        name: 'uploadImage',
        access: {
            path: '/visor/image',
            method: 'POST'
        },
        roles: [
            'Admin',
            'Contributor',
            'Editor'
        ],
    },
    {
        name: 'getImages',
        access: {
            path: '/visor/images',
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
