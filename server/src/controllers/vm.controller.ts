import type { Request, Response } from "express";
import VMManager from "../services/VMManager.js";

export async function restartVM(req: Request, res: Response) {
    const id: string = req.cookies.browserboot__session;
    if(!id || typeof id !== 'string') return res.status(404).json({ error: 'Invalid session ID' });
    await VMManager.restartVM(id);
    res.json({ message: "success" });
}