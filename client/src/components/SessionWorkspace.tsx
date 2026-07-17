import { Camera, LoaderCircle, Maximize2, Minimize2, Play, RotateCcw, Square } from "lucide-react";
import NoVnc from "./NoVnc";
import SerialTerminal from "./SerialTerminal";

interface SessionWorkspaceProps {
    vncUrl: string | null;
    serialUrl: string | null;
    running: boolean;
    fullscreen: boolean;
    toggleFullscreen: () => void;
    onStopSession: () => void;
    launching: boolean;
    initializing: boolean;
}

export default function SessionWorkspace({
    vncUrl,
    serialUrl,
    running,
    fullscreen,
    toggleFullscreen,
    onStopSession,
    launching,
    initializing
}: SessionWorkspaceProps) {

    const onRestartVM = async () => {
        await fetch(window.location.protocol + "//" + window.location.host + "/api/vm/restart", {
            method: "POST"
        });
    }

    return (
        <section className={`workspace-shell${fullscreen ? " fullscreen-shell" : ""}`}>
            <div className={`workspace-grid${fullscreen ? " fullscreen-grid" : ""}`}>
                <section className={`display-panel${fullscreen ? " fullscreen-display-panel" : ""}`}>
                    <div className="panel-header">
                        <div>
                            <h2>Framebuffer</h2>
                            <p>Live display output</p>
                        </div>

                        <div className="panel-actions">
                            <button type="button" title="Restart" onClick={onRestartVM} disabled={!running}>
                                <RotateCcw size={16} />
                            </button>
                            <button type="button" title="Stop" onClick={onStopSession} disabled={!running}>
                                <Square size={16} />
                            </button>
                            <button type="button" title="Screenshot" disabled={!running}>
                                <Camera size={16} />
                            </button>
                            <button type="button" title="Fullscreen" onClick={toggleFullscreen}>
                                {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className={`display${fullscreen ? " fullscreen-display" : ""}`}>
                        {vncUrl ? (
                            <NoVnc url={vncUrl} />
                        ) : (
                            <div className={`empty-state${launching ? " is-loading" : ""}`}>
                                <Play size={48} />
                                <h3>No active session</h3>
                                <p>Launch a session to boot your kernel in the browser.</p>
                            </div>
                        )}

                        {(launching || initializing) && (
                            <div className="loading-overlay">
                                <div className="loading-ring" />
                                <h3>{launching ? "Preparing your session" : "Checking session state"}</h3>
                                <p>{launching ? "Your VM is waking up and the display will appear shortly." : "A quick status check is running in the background."}</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className={`terminal-panel${fullscreen ? " fullscreen-terminal-panel" : ""}`}>
                    <div className="panel-header">
                        <div>
                            <h2>Serial Console</h2>
                            <p>Kernel and debug output</p>
                        </div>

                        <div className="serial-status">
                            <span className={`status-dot ${running ? "running" : ""}`} />
                            {running ? "Connected" : "Disconnected"}
                        </div>
                    </div>

                    <div className="terminal-body">
                        <SerialTerminal serialUrl={serialUrl} />

                        {!serialUrl && !launching && (
                            <div className="terminal-placeholder">
                                Serial output will appear here once the session is running.
                            </div>
                        )}

                        {launching && (
                            <div className="terminal-placeholder">
                                <LoaderCircle size={20} className="spin" />
                                <span>Waiting for serial output…</span>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </section>
    );
}
