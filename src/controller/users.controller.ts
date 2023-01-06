import { Request, Response } from 'express';
import { LOG } from '../util';
import * as usersDatabase from '../util/database/org-users.database';

function createUser(req: Request, res: Response) {
    const { handle, role} = req.body;
    if (handle && role) {
        if (role == 'Admin' || role=='Editor' || role == 'Contributor') {
            usersDatabase.createUser(res.locals.orgName, handle, role, (success, token) => {
                if (success && token) {
                    return res.status(200).json({
                        message: 'Successfully created user',
                        code: 'Success',
                        data: {
                            userKey: token
                        }
                    })
                } else {
                    return res.status(500).json({
                        message: 'Could not create User, please check for Duplicated Handles and try again.',
                        code: 'InternalError'
                    })
                }
            })
        } else {
            return res.status(400).json({
                message: 'The item: "role" can only be: "Admin", "Editor" or "Contributor".',
                code: 'IncompleteBody'
            });
        }
    } else {
        return res.status(400).json({
            message: 'Missing items in body for this request. Please add a "handle" and "role" item to the request body.',
            code: 'IncompleteBody'
        });
    }
}

function listUser(req: Request, res: Response) {
    const { length, from, to } = req.query;
    if (length && from && to && typeof(length) == 'string' && typeof(from) == 'string' && typeof(to) == 'string') {
        usersDatabase.getAllUsers(res.locals.orgName, {length, from, to}, (success, data) => {
            if (success && data) {
                return res.status(200).json({
                    message: 'Successfully fetched users',
                    code: 'Success',
                    data
                });
            } else {
                return res.status(500).json({
                    message: 'Could not fetch users. Please try again later.',
                    code: 'InternalError'
                });
            }
        })
    } else if (length && typeof(length) == 'string') {
        usersDatabase.getAllUsers(res.locals.orgName, {length}, (success, data) => {
            if (success && data) {
                return res.status(200).json({
                    message: 'Successfully fetched users',
                    code: 'Success',
                    data
                });
            } else {
                return res.status(500).json({
                    message: 'Could not fetch users. Please try again later.',
                    code: 'InternalError'
                });
            }
        });
    } else {
        usersDatabase.getAllUsers(res.locals.orgName, {}, (success, data) => {
            if (success && data) {
                return res.status(200).json({
                    message: 'Successfully fetched users',
                    code: 'Success',
                    data
                });
            } else {
                return res.status(500).json({
                    message: 'Could not fetch users. Please try again later.',
                    code: 'InternalError'
                });
            }
        });
    }
}

function getUser(req: Request, res: Response) {
    const { handle } = req.query;
    if (handle && typeof(handle) == 'string') {
        usersDatabase.getUserFromHandle(res.locals.orgName, handle, (success, data) => {
            if (success) {
                return res.status(200).json({
                    message: 'Successfully fetched user',
                    code: 'Success',
                    data
                });
            } else {
                return res.status(500).json({
                    message: 'Could not fetch user. Please check the provided "handle" and try again.',
                    code: 'InternalError'
                });
            }
        })
    } else {
        return res.status(400).json({
            message: 'Missing items in params for this request. Please add a "handle"  item to the request params.',
            code: 'IncompleteBody'
        })
    }
}

function editUser(req: Request, res: Response) {
    const { handle, update } = req.body;
    if (handle && update) {
        usersDatabase.getUserFromHandle(res.locals.orgName, handle, (success, user) => {
            if (success && user) {
                usersDatabase.updateUser(res.locals.orgName, user.token, update.role, (success) => {
                    if (success) {
                        return res.status(200).json({
                            message: 'Updated user successfully',
                            code: 'Success'
                        })
                    } else {
                        return res.status(500).json({
                            message: 'Could not update User, please check all information and try again.',
                            code: 'InternalError'
                        })
                    }
                })
            } else {
                return res.status(400).json({
                    message: 'Could not find user with "handle" provided.',
                    code: 'IncompleteBody'
                })
            }
        })
    }
}

function deleteUser(req: Request, res: Response) {
    const { token, reason } = req.body;
    if (token && reason) {
        usersDatabase.deleteUser(res.locals.orgName, token, (success) => {
            if (success) {
                LOG.info(`Deleted User: ${token}, because: ${reason}`); // TODO: Implement Changes to report this stuff
                return res.status(200).json({
                    message: 'Successfully deleted User.',
                    code: 'Success'
                })
            } else {
                return res.status(500).json({
                    message: 'Could not delete User, please try again later.',
                    code: 'InternalError'
                })
            }
        })
    } else {
        return res.status(400).json({
            message: 'Missing items in body for this request. Please add a "token" and "reason" item to the request body.',
            code: 'IncompleteBody'
        });
    }
}

export default {
    createUser,
    listUser,
    getUser,
    editUser,
    deleteUser
}