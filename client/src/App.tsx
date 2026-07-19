import { useEffect, useRef, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import AppHeader from "./components/AppHeader";
import SessionWorkspace from "./components/SessionWorkspace";
import StatusBar from "./components/StatusBar";
import BootOptions, { type BootOptionsConfig } from "./components/BootOptions";
import { useAppTheme } from "./hooks/useAppTheme";
import "./styles.css";

interface SessionResponse {
    id: string;
    vncUrl: string;
    serialUrl: string;
}

const defaultBootOptions: BootOptionsConfig = {
    ram: "512M",
    disk: "2G",
    cpu: 1,
    image: "alpine-std.qcow2",
};

function App() {
    const theme = useAppTheme();
    const [running, setRunning] = useState(false);
    const [sessionId, setSessionId] = useState("-");
    const [fullscreen, setFullscreen] = useState(false);
    const [launching, setLaunching] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [bootOptions, setBootOptions] = useState(defaultBootOptions);
    const [showBootModal, setShowBootModal] = useState(false);

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
        .catch(() => {
            console.log("Existing session invalid. Ignoring...");
            const params = new URLSearchParams(window.location.search);
            const boot = params.get("boot");
            if (boot !== null) {
                const opts = { ...defaultBootOptions, image: boot || defaultBootOptions.image };
                setBootOptions(opts);
                setTimeout(() => onLaunchSessionWithOpts(opts), 50);
            }
        })
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

    const onLaunchSessionWithOpts = async (opts?: BootOptionsConfig) => {
        if (running || launching) return;
        setLaunching(true);
        try {
            const response = await fetch(window.location.protocol + "//" + window.location.host +"/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(opts || bootOptions),
            });

            if (!response.ok) throw new Error("Unable to launch session");

            const data: SessionResponse = await response.json();
            setSessionId(data.id);
            setRunning(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLaunching(false);
        }
    };

    const onLaunchSession = () => {
        setShowBootModal(true);
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await workspaceRef.current?.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    };

    return (
        <Box
            minH="100vh"
            bg={theme.pageBg}
            bgImage={theme.pageAccent}
        >
            <Flex
                direction="column"
                maxW={fullscreen ? "none" : "1600px"}
                minH={fullscreen ? "100dvh" : "100vh"}
                mx="auto"
                px={fullscreen ? 0 : { base: 4, md: 6 }}
                py={fullscreen ? 0 : { base: 4, md: 5 }}
                gap={fullscreen ? 0 : 4}
            >
                <AppHeader
                    onLaunchSession={onLaunchSession}
                    running={running}
                    sessionId={sessionId}
                    fullscreen={fullscreen}
                    launching={launching}
                />

                <Box
                    ref={workspaceRef}
                    flex="1"
                    minH={0}
                    h="100%"
                    overflowY="auto"
                    bg={fullscreen ? theme.fullscreenBg : undefined}
                >
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
                </Box>

                {!fullscreen && <StatusBar sessionId={sessionId} running={running} />}

                <BootOptions
                    visible={showBootModal}
                    initial={bootOptions}
                    onChange={setBootOptions}
                    onCancel={() => setShowBootModal(false)}
                    onConfirm={(opts) => { setShowBootModal(false); onLaunchSessionWithOpts(opts); }}
                />
            </Flex>
        </Box>
    );
}

export default App;
