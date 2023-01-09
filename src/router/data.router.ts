import { Router } from "express";
import dataController from "../controller/data.controller";

const router = Router();

router.post('/create-system', dataController.dataCreateSystem);
router.post('/add-stellar-object', dataController.dataCreateStellarObject);
router.post('/add-planet-object', dataController.dataCreatePlanetLevelObject);
router.post('/delete-system', dataController.deleteSystem);
router.post('/delete-stellar-object', dataController.deleteStellarObject);
router.post('/delete-planet-object', dataController.deletePlanetLevelObject);


export default router;