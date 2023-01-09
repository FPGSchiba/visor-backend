import { Router } from "express";
import dataController from "../controller/data.controller";

const router = Router();

router.get('/get-systems', dataController.listSystems);
router.get('/get-system', dataController.dataGetSystem);


export default router;