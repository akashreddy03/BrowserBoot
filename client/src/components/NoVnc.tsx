import { Box } from "@chakra-ui/react";
import RFB from "@novnc/novnc";
import React, { useEffect } from "react";

export default function NoVnc({ url }: { url: string | null }) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const RFBRef = React.useRef<RFB | null>(null);

    useEffect(() => {
        if(!containerRef.current || !url) return;

        const rfb = new RFB(containerRef.current, url);
        RFBRef.current = rfb;

        rfb.scaleViewport = true;
        rfb.resizeSession = false;

        const viewport = containerRef.current?.querySelector("div");

        if (viewport instanceof HTMLDivElement) {
            viewport.style.background = "#000";
        }

        return () => {
            RFBRef.current?.disconnect();
            RFBRef.current = null;
        }
    }, [url]);

    return (
        <Box
            ref={containerRef}
            w="100%"
            h="100%"
            bg="black"
        />
    );
}
