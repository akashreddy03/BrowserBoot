import { Router } from "express"
import { restartVM } from "../controllers/vm.controller.js";

const router = Router();

router.post('/restart', restartVM);

export default router;