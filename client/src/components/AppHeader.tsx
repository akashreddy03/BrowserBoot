import { LoaderCircle, Play } from "lucide-react";

interface AppHeaderProps {
    onLaunchSession: () => void;
    running: boolean;
    sessionId: string;
    fullscreen: boolean;
    launching: boolean;
}

export default function AppHeader({ onLaunchSession, running, sessionId, fullscreen, launching }: AppHeaderProps) {
    return (
        <header className={`navbar${fullscreen ? " compact" : ""}`}>
            <div className="brand-block">
                <div className="brand-title-row">
                    <span className="brand-mark" />
                    <h1>BrowserBoot</h1>
                </div>
                {!fullscreen && <p className="brand-tagline">Boot and test your operating system directly from your browser.</p>}
            </div>

            <div className="navbar-actions">
                <div className={`session-pill ${running ? "running" : ""}`}>
                    <span className={`status-dot ${running ? "running" : ""}`} />
                    {running ? `Session ${sessionId.slice(0, 8)}` : "Ready to launch"}
                </div>

                <button className={`launch-btn${launching ? " loading" : ""}`} onClick={onLaunchSession} disabled={running || launching}>
                    {launching ? <LoaderCircle size={18} className="spin" /> : <Play size={18} />}
                    {launching ? "Launching..." : "Launch Session"}
                </button>
            </div>
        </header>
    );
}
