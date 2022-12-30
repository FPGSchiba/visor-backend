import { Router } from "express";
import managementController from "../controller/management.controller";

const router = Router();

router.get('/orgs', managementController.getOrgs);
router.get('/activation-token', managementController.getOrgActivationToken);

router.post('/create-org', managementController.createOrg);
router.post('/delete-org', managementController.deleteOrg);

export default router;