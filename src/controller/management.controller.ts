import { Request, Response } from 'express';

function getOrgs(req: Request, res: Response) {
    // TODO: get information on which orgs are active
    return res.status(200).json({
        message: 'This is lucky :D'
    });
}

function createOrg(req: Request, res: Response) {
    // TODO: Implement this feature. (DB is already here)
    return res.status(200).json({
        message: 'This is lucky :D'
    });
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