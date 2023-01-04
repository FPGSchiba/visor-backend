// TODO: Middleware to authenticate Users from a Org
import { NextFunction, Request, Response } from "express"
import { LOG } from "../util";

export const orgAuthentication = function (req: Request, res: Response, next: NextFunction) {
    LOG.warn('skipping User and Org auth, because it is not Implemented.');
    next();
}
  