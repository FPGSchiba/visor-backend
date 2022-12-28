import { Router } from "express";
import managementController from "../controller/management.controller";

const router = Router();

// TODO: GET orgs
router.get('/orgs', managementController.getOrgs);

// TODO: POST create-org
router.post('/create-org')

export default router;