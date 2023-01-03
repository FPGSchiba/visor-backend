import { createTable, getAllTables } from '../database/database';
import { PERMISSIONS_TABLE_NAME } from '../config';
import { getPermissionsTableFromName } from '../models/premissions-model';
import { LOG } from '../logger';
import { IPermission } from '../formats/user.format';
import { createPermissions } from '../database/permissions.database';

const beginningPermissions = [
    {
        name: 'createUser',
        access: {
            path: '/users/create',
            method: 'POST'
        },
        roles: [
            'Admin'
        ],
    },
    {
        name: 'listUsers',
        access: {
            path: '/users/list',
            method: 'GET'
        },
        roles: [
            'Admin'
        ]
    },
    {
        name: 'getUser',
        access: {
            path: '/users/*',
            method: 'GET'
        },
        roles: [
            'Admin'
        ]
    },
    {
        name: 'editUser',
        access: {
            path: '/users/*',
            method: 'POST'
        },
        roles: [
            'Admin'
        ]
    },
    {
        name: 'deleteUser',
        access: {
            path: '/users/delete',
            method: 'POST'
        },
        roles: [
            'Admin'
        ]
    },
    {
        name: 'getVISORs',
        access: {
            path: '/visor/list',
            method: 'GET'
        },
        roles: [
            'Admin',
            'Contributor',
            'Editor'
        ]
    },
    {
        name: 'createVISOR',
        access: {
            path: '/visor/create',
            method: 'POST'
        },
        roles: [
            'Admin',
            'Contributor',
            'Editor'
        ]
    },
    {
        name: 'getVISOR',
        access: {
            path: '/visor/*',
            method: 'GET'
        },
        roles: [
            'Admin',
            'Contributor',
            'Editor'
        ]
    },
    {
        name: 'updateVISOR',
        access: {
            path: '/visor/*',
            method: 'POST'
        },
        roles: [
            'Admin',
            'Contributor',
            'Editor'
        ]
    },
    {
        name: 'approveVISOR',
        access: {
            path: '/visor/approve',
            method: 'POST'
        },
        roles: [
            'Admin',
            'Contributor'
        ]
    },
    {
        name: 'deleteVISOR',
        access: {
            path: '/visor/delete',
            method: 'POST'
        },
        roles: [
            'Admin',
            'Contributor'
        ]
    }
] as IPermission[]

export function runMigrationTest(callback: (success: boolean) => void) { // TODO: Change Name of function
    getAllTables((tables) => {
        if (!(tables && tables.includes(PERMISSIONS_TABLE_NAME))) {
            const table = getPermissionsTableFromName(PERMISSIONS_TABLE_NAME);
            createTable(table, (tableSuccess) => {
                if (tableSuccess) {
                    createPermissions(beginningPermissions, (permissionSuccess) => {
                        callback(permissionSuccess);
                    })
                } else {
                    callback(tableSuccess);
                }
            });
        } else {
            LOG.warn('Permissions Table does already exist. Skipping this Step.');
            callback(true);
        }
    })
}
