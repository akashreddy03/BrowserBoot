import type { Request, Response } from "express";
import VMManager from "../services/VMManager.js";
import fs from "fs";
import path from "path";

export async function restartVM(req: Request, res: Response) {
    const id: string = req.cookies.browserboot__session;
    if(!id || typeof id !== 'string') return res.status(404).json({ error: 'Invalid session ID' });
    await VMManager.restartVM(id);
    res.json({ message: "success" });
}

const IMAGES_DIR = path.resolve("../images");

interface ImageInfo {
    filename: string;
    label: string;
    type: "iso" | "qcow2";
    size: number;
}

export function getImages(_req: Request, res: Response) {
    try {
        const files = fs.readdirSync(IMAGES_DIR);

        const images: ImageInfo[] = files
            .filter((file) => file.endsWith(".iso") || file.endsWith(".qcow2"))
            .map((file) => {
                const stat = fs.statSync(path.join(IMAGES_DIR, file));
                const name = file.replace(/\.(iso|qcow2)$/, "");
                // Generate a human-friendly label
                const label = name
                    .replace(/[_-]/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());

                return {
                    filename: file,
                    label: file.endsWith(".iso") ? `${label} (ISO)` : `${label} (Disk)`,
                    type: file.endsWith(".iso") ? "iso" as const : "qcow2" as const,
                    size: stat.size,
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));

        res.json(images);
    } catch (err) {
        res.status(500).json({ error: "Failed to read images directory" });
    }
}