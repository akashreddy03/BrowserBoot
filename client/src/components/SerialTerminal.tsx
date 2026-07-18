import { useEffect, useRef } from "react";
import { Terminal } from "xterm";

import "xterm/css/xterm.css";

export default function SerialTerminal({ serialUrl }: { serialUrl: string | null }) {
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!terminalRef.current || !serialUrl) return;

        const container = terminalRef.current;
        const term = new Terminal({
            cursorBlink: true,
            convertEol: true,
            fontFamily: "JetBrains Mono, monospace",
            theme: {
                foreground: "#00FF00",
                background: "#020617",
                cursor: "#00FF00",
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
            term.writeln("Websocket closed: " + event.code.toString());
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
    }, [serialUrl]);

    return <div ref={terminalRef} className="terminal-surface" />;
}
