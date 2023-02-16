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
    },
    {
        name: 'deleteImage',
        access: {
            path: '/visor/image',
            method: 'DELETE'
        },
        roles: [
            'Admin',
            'Contributor',
            'Editor'
        ]
    },
    {
        name: 'updateImage',
        access: {
            path: '/visor/image-desc',
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
