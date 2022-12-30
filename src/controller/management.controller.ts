import { Request, Response } from 'express';
import { LOG } from '../util';
import { deleteNotActiveOrg, fetchActivationToken, getAllOrgs, registerNewOrgCreation } from '../util/database/create-org.database';

function getOrgs(req: Request, res: Response) {
    getAllOrgs((success, data) => {
        if (success) {
            return res.status(200).json({
                message: 'Successfully fetched all Orgs.',
                code: 'Success',
                body: data
            })
        } else {
            return res.status(500).json({
                message: 'Could not fetch the Database at the moment, please check your information and try again later.',
                code: 'InternalError'
            })
        }
    });
}

function createOrg(req: Request, res: Response) {
    const { name, owner } = req.body;
    if (name && owner) {
        registerNewOrgCreation(name, owner, (success, creationToken) => {
            if (success) {
                return res.status(200).json({
                    message: 'Successfully created org creation entry! Please activate this Org to use it.',
                    code: 'Success',
                    data: {
                        activationToken: creationToken
                    }
                });
            } else {
                return res.status(500).json({
                    message: 'Could not create the org activation token, please',
                    code: 'InternalError'
                })
            }
        });
    } else {
        return res.status(400).json({
            message: 'Missing items in body for this request. Please add a "name" and "owner" item to the request body.',
            code: 'IncompleteBody'
        });
    }
}

function activateOrg(req: Request, res: Response) {
    // TODO: Implement activation
    return res.status(200).json({
        message: 'This is lucky :D'
    });
}

function deleteOrg(req: Request, res: Response) {
    const { name } = req.body;
    const onlyInactive = true; // TODO: Change this once delete method of entire orgs is done :D
    if (name) {
        if (onlyInactive) {
            deleteNotActiveOrg(name, (success) => {
                if (success) {
                    return res.status(200).json({
                        message: `Successfully deleted Org: ${name}. If the org existed, that is.`,
                        code: 'Success'
                    })
                } else {
                    return res.status(500).json({
                        message: `Could not delete Org. Please check your request and try again.`,
                        code: 'InternalError'
                    })
                }
            })
        } else {
            // TODO: Implement deleting entire Orgs
            LOG.error('Not Implemented, please help me ;)');
            return res.status(500).json({
                message: 'Congrats, you broke VISOR quite a bit. This is a feature, that is not Implemented yet, please wait :D',
                code: 'NotImplemented'
            });
        }
    } else {
        return res.status(400).json({
            message: 'Missing items in body for this request. Please add a "name" item to the request body.',
            code: 'IncompleteBody'
        });
    }
}

function getOrgActivationToken(req: Request, res: Response) {
    const { name } = req.query;
    console.log(name);
    if (name && typeof(name) == 'string') {
        fetchActivationToken(name, (success, token) => {
            if (success) {
                return res.status(200).json({
                    message: 'Successfully fetched activation Token.',
                    code: 'Success',
                    body: {
                        activationToken: token
                    }
                })
            } else {
                return res.status(500).json({
                    message: 'Could not get the Org activation token, please ensure, this orgName exists.',
                    code: 'InternalError'
                })
            }
        })
    } else {
        return res.status(400).json({
            message: 'Not all necessary params are given. Parameters needed: "name"',
            code: 'IncompleteBody'
        });
    }
}

export default {
    getOrgs,
    createOrg,
    activateOrg,
    deleteOrg,
    getOrgActivationToken
}