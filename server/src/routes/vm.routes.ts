import { Router } from "express"
import { restartVM, getImages } from "../controllers/vm.controller.js";

const router = Router();

router.post('/restart', restartVM);
router.get('/images', getImages);

export default router;
