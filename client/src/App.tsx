import { useEffect, useRef, useState } from "react";
import AppHeader from "./components/AppHeader";
import SessionWorkspace from "./components/SessionWorkspace";
import StatusBar from "./components/StatusBar";
import "./styles.css";

interface SessionResponse {
    id: string;
    vncUrl: string;
    serialUrl: string;
}

function App() {
    const [running, setRunning] = useState(false);
    const [sessionId, setSessionId] = useState("-");
    const [fullscreen, setFullscreen] = useState(false);
    const [launching, setLaunching] = useState(false);
    const [initializing, setInitializing] = useState(true);

    const workspaceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = () => {
            setFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handler);

        setInitializing(true);

        fetch(window.location.protocol + "//" + window.location.host + "/api/session")
        .then((response: Response) => {
            if(!response.ok) throw new Error("Invalid existing session...");

            return response.json();
        })
        .then((data) => {
            setSessionId(data.id);
            setRunning(true);
        })
        .catch(() => console.log("Existing session invalid. Ignoring..."))
        .finally(() => setInitializing(false)); 

        return () => {
            document.removeEventListener("fullscreenchange", handler);
        };
    }, []);

    const onStopSession = async () => {
        if (!window.confirm("Stop and delete this session?")) {
            return;
        }

        const res = await fetch(window.location.protocol + "//" + window.location.host + "/api/session/" + sessionId, {
            method: "DELETE"
        });
        if(res.status == 200) {
            setSessionId("-");
            setRunning(false);
        } else {
            console.log("Deleting session failed...");
        }
 
    }

    const onLaunchSession = async () => {
        if (running || launching) {
            return;
        }

        setLaunching(true);

        try {
            const response = await fetch(window.location.protocol + "//" + window.location.host +"/api/session", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Unable to launch session");
            }

            const data: SessionResponse = await response.json();

            setSessionId(data.id);
            setRunning(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLaunching(false);
        }
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await workspaceRef.current?.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    };

    return (
        <div className={`app${fullscreen ? " fullscreen-mode" : ""}`}>
            <AppHeader
                onLaunchSession={onLaunchSession}
                running={running}
                sessionId={sessionId}
                fullscreen={fullscreen}
                launching={launching}
            />

            <div ref={workspaceRef} className={`workspace-stage${fullscreen ? " fullscreen-stage" : ""}`}>
                <SessionWorkspace
                    vncUrl={running ? (window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws/vnc/" + sessionId : null}
                    serialUrl={running ? (window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + "/ws/serial/" + sessionId : null}
                    running={running}
                    fullscreen={fullscreen}
                    toggleFullscreen={toggleFullscreen}
                    onStopSession={onStopSession}
                    launching={launching}
                    initializing={initializing}
                />
            </div>

            {!fullscreen && <StatusBar sessionId={sessionId} running={running} />}
        </div>
    );
}

export default App;