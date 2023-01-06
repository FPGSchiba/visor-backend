import { NextFunction, Request, Response } from "express"
import { LOG } from "../util";
import { getOrgNameFromKey } from "../util/database/create-org.database";
import { getUserFromKey } from "../util/database/org-users.database";
import { roleAccessValidation } from "../util/database/permissions.database";

export const orgAuthentication = function (req: Request, res: Response, next: NextFunction) {
    // Extract both keys
    const userKey = req.headers['x-visor-user-key'];
    const orgKey = req.headers['x-visor-org-key'];

    if (userKey && orgKey && typeof(orgKey) == 'string' && typeof(userKey) == 'string') {
        // Get OrgName if fails => 401
        getOrgNameFromKey(orgKey, (success, orgName) => {
            if (success && orgName) {
                // Get User if fails => 401
                getUserFromKey(userKey, orgName, (success, data) => {
                    if (success && data) {
                        // Validate User Rights
                        roleAccessValidation(data.role, res.locals.access, (success, result) => {
                            if (success && result) {
                                // Set User & OrgName Infos into request
                                res.locals.orgName = orgName;
                                res.locals.userKey = userKey;
                                res.locals.userRole = data.role;
                                res.locals.handle = data.handle;
                                // Next
                                next();
                            } else {
                                LOG.warn('User with not enough rights tried to access a restricted Path');
                                return res.status(401).json({
                                    message: 'You do not have enough rights to access this Path. Please try a different user.',
                                    code: 'Unauthorized'
                                })
                            }
                        })
                    } else {
                        LOG.warn('Wrong VISOR User Key provided.');
                        return res.status(401).json({
                            message: 'User with given "X-VISOR-User-Key" does not exist.',
                            code: 'Unauthorized'
                        })
                    }
                });
            } else {
                LOG.warn('Wrong VISOR Org Key provided.');
                return res.status(401).json({
                    message: 'Organization with given "X-VISOR-Org-Key" does not exist.',
                    code: 'Unauthorized'
                });
            }
        });
    } else {
        LOG.warn('Protected Path called with not enough Authorization Headers.');
        return res.status(401).json({
            message: 'Not all necessary Keys found, please provide: "X-VISOR-User-Key" and "X-VISOR-Org-Key" headers.',
            code: 'Unauthorized'
        })
    }
}
  