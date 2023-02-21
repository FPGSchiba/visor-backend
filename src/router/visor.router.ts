import { Router } from "express";
import visorController from "../controller/visor.controller";

const router = Router();

router.get('/list', visorController.listVISORs);
router.get('/get', visorController.getVISOR);
router.get('/images', visorController.getImages);

router.post('/create', visorController.createVISOR);
router.post('/update', visorController.updateVISOR);
router.post('/delete', visorController.deleteVISOR);
router.post('/approve', visorController.approveVISOR);
router.post('/image', visorController.uploadImage);
router.post('/image-desc', visorController.updateImage);
router.post('/om-similarity', visorController.OMSimilarity);

router.delete('/image', visorController.deleteImage);

export default router;