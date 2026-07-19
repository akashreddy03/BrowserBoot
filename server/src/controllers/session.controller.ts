import type { Request, Response } from "express";
import SessionManager from "../services/SessionManager.js";
import type { BootOptions } from "../types/Session.js";

export async function createSession(req: Request, res: Response) {
    const id = req.cookies.browserboot__session;
    if(id && SessionManager.getSession(id)) {
        res.status(409);
    } else {
        // Parse boot options from request body (sent by client BootOptions dialog)
        const body = req.body as Partial<BootOptions> | undefined;
        const bootOptions: BootOptions | undefined = body?.ram && body?.disk && body?.image
            ? {
                ram: body.ram,
                disk: body.disk,
                cpu: body.cpu ?? 1,
                image: body.image,
            }
            : undefined;

        const session = await SessionManager.createSession(bootOptions);
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