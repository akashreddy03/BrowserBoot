import { type Session, type SessionResponse, SessionState, type BootOptions } from '../types/Session.js';
import { nanoid } from 'nanoid';
import VMManager from './VMManager.js';

class SessionManager {
    private sessions = new Map<string, Session>();

    async createSession(bootOptions?: BootOptions): Promise<SessionResponse> {

        const session: Session = {
            id: nanoid(10),
            state: SessionState.Running,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 1800000), // 30 mins from now
            bootOptions,
        };

        const vm = await VMManager.start(session.id, bootOptions);

        session.vm = vm;

        this.sessions.set(session.id, session);

        session.vm.process.on("exit", () => {
            if(session.state == SessionState.Stopped) return;
            this.deleteSession(session.id);
        });

        return session;
    }

    getSession(id: string): Session | undefined {
        return this.sessions.get(id);
    }

    getSessions(): Session[] {
        return Array.from(this.sessions.values());
    }

    async deleteSession(id: string) {
        const session = this.getSession(id);
        if(!session) return;
        session.state = SessionState.Stopped;
        await VMManager.stop(id);
        this.sessions.delete(id);
    }
}

export default new SessionManager();