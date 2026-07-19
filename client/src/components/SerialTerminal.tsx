import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { useColorModeValue } from "./ui/color-mode";

import "xterm/css/xterm.css";

export default function SerialTerminal({ serialUrl }: { serialUrl: string | null }) {
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminalFg = useColorModeValue("#16a34a", "#4ade80");

    useEffect(() => {
        if (!terminalRef.current || !serialUrl) return;

        const container = terminalRef.current;
        const term = new Terminal({
            cursorBlink: true,
            convertEol: true,
            fontFamily: "JetBrains Mono, monospace",
            theme: {
                foreground: terminalFg,
                background: "transparent",
                cursor: terminalFg,
            },
        });

        term.open(container);

        const fitTerminal = () => {
            if (container.clientWidth === 0 || container.clientHeight === 0) {
                return;
            }

            requestAnimationFrame(() => {
                const width = Math.max(38, Math.floor(container.clientWidth / 9));
                const height = Math.max(10, Math.min(42, Math.floor(container.clientHeight / 18)));
                term.resize(width, height);
            });
        };

        const resizeHandler = () => {
            fitTerminal();
        };

        window.addEventListener("resize", resizeHandler);

        const ws = new WebSocket(serialUrl);

        ws.onmessage = (event) => {
            term.write(event.data);
        };

        ws.onerror = () => {
            term.writeln("\r\n[serial] connection error");
        };

        ws.onclose = (event) => {
            term.writeln("Websocket closed: " + event.code.toString() + " " + event.reason.toString());
        }

        term.onData((data) => {
            ws.send(data);
        });

        fitTerminal();

        return () => {
            window.removeEventListener("resize", resizeHandler);
            ws.close();
            term.dispose();
        };
    }, [serialUrl, terminalFg]);

    return (
        <Box
            ref={terminalRef}
            h="100%"
            w="100%"
            minH="100%"
            position="relative"
            zIndex={0}
            overflow="hidden"
        />
    );
}
