import { NextFunction, Request, Response } from "express"
import { LOG } from "../util";
import { getAdminSecret } from "../util/credentials";

export const adminAuthentication = function (req: Request, res: Response, next: NextFunction) {
    const visorAPIKey = req.headers['x-visor-api-key'];
    if (!visorAPIKey) {
        LOG.warn('No VISOR API Key found.');
        return res.status(401).json({
            message: 'No X-VISOR-API-KEY provided, please provide this header in order to authenticate.',
            code: 'Unauthorized'
        });
    }
    getAdminSecret((adminSecret) => {
        if (adminSecret == visorAPIKey) {
            next();
        } else {
            console.log(adminSecret); // TODO: Remove this once in production for testing purposes only!!
            LOG.warn('Wrong VISOR API Key provided.');
            return res.status(401).json({
                message: 'The given VISOR-Admin-API key is not correct.',
                code: 'Unauthorized'
            });
        }
    })
}
  