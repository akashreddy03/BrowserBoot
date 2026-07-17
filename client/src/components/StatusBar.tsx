import { Activity } from "lucide-react";

interface StatusBarProps {
    sessionId: string;
    running: boolean;
}

export default function StatusBar({ sessionId, running }: StatusBarProps) {
    return (
        <section className="status-grid">
            <div className="status-card">
                <div className="status-title">Session</div>
                <div className="status-value">{sessionId}</div>
            </div>

            <div className="status-card">
                <div className="status-title">Status</div>
                <div className={running ? "pill running" : "pill stopped"}>
                    {running ? "Running" : "Stopped"}
                </div>
            </div>

            <div className="status-card">
                <div className="status-title">Resolution</div>
                <div className="status-value">1024 × 768</div>
            </div>

            <div className="status-card">
                <div className="status-title">Memory</div>
                <div className="status-value">512 MB</div>
            </div>

            <div className="status-card">
                <div className="status-title">CPU</div>
                <div className="status-value">1 vCPU</div>
            </div>

            <div className="status-card">
                <div className="status-title">Resources</div>
                <div className="resource">
                    <Activity size={16} />
                    <span>Healthy</span>
                </div>
            </div>
        </section>
    );
}
