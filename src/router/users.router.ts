import { Router } from "express";
import usersController from "../controller/users.controller";

const router = Router();

router.get('/list', usersController.listUser);
router.get('/get', usersController.getUser);

router.post('/create', usersController.createUser);
router.post('/update', usersController.editUser);
router.post('/delete', usersController.deleteUser);

export default router;