import type { Request, Response } from "express";
import SessionManager from "../services/SessionManager.js";

export async function createSession(req: Request, res: Response) {
    const id = req.cookies.browserboot__session;
    if(id && SessionManager.getSession(id)) {
        res.status(409);
    } else {
        const session = await SessionManager.createSession();
        res.cookie("browserboot__session", session.id, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 60 * 1000
        });
        res.json(session);
    }
    
}

export function getSession(req: Request, res: Response) {
    const id  = req.cookies.browserboot__session;

    if(!id || typeof id !== 'string') return res.status(404).json({ error: 'Invalid session ID' });

    const session = SessionManager.getSession(id);

    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
}

export async function deleteSession(req: Request, res: Response) {
    const id  = req.params.id;
    
    if(!id || typeof id !== 'string') return res.status(404).json({ error: 'Invalid session ID' });

    const session = SessionManager.getSession(id);

    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    await SessionManager.deleteSession(id);

    res.json({ message: 'Session deleted successfully' });
}
