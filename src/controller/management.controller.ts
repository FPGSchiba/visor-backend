import { Request, Response } from 'express';
import { registerNewOrgCreation } from '../util/database/create-org.database';

function getOrgs(req: Request, res: Response) {
    // TODO: get information on which orgs are active
    return res.status(200).json({
        message: 'This is lucky :D'
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
                        creationToken: creationToken
                    }
                });
            } else {
                return res.status(500).json({
                    message: 'Could not create the org creation token, please',
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
    // TODO: Implement activation and creation.
    return res.status(200).json({
        message: 'This is lucky :D'
    });
}

export default {
    getOrgs,
    createOrg,
    activateOrg
}