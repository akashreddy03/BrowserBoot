import type { VM } from "./VM.js";

export enum SessionState {
    Running = 'running',
    Stopped = 'stopped',
    Waiting = 'waiting'
}

export interface BootOptions {
    ram: string;
    disk: string;
    cpu: number;
    image: string;
}

export interface SessionResponse {
    id: string;
    state: SessionState;
    createdAt: Date;
    expiresAt: Date;
}

export interface Session {
    id: string;
    state: SessionState;
    createdAt: Date;
    expiresAt: Date;
    vm?: VM;
    bootOptions?: BootOptions | undefined;
}
