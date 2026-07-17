import { Router } from "express";
import { createSession, getSession, deleteSession } from "../controllers/session.controller.js";

const router = Router();

router.post('/', createSession);

router.get('/', getSession);

router.delete('/:id', deleteSession);

export default router;
