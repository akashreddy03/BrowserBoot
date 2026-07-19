import {
    Badge,
    Box,
    Flex,
    Grid,
    Heading,
    HStack,
    IconButton,
    Spinner,
    Text,
} from "@chakra-ui/react";
import {
    LuCamera,
    LuLoaderCircle,
    LuMaximize2,
    LuMinimize2,
    LuPlay,
    LuRotateCcw,
    LuSquare,
} from "react-icons/lu";
import NoVnc from "./NoVnc";
import SerialTerminal from "./SerialTerminal";
import { Tooltip } from "./ui/tooltip";
import { useAppTheme } from "../hooks/useAppTheme";

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

const spin = {
    animation: "spin 0.8s linear infinite",
    keyframes: {
        spin: {
            to: { transform: "rotate(360deg)" },
        },
    },
};

const panelStyles = (theme: ReturnType<typeof useAppTheme>) => ({
    borderWidth: "1px",
    borderColor: theme.panelBorder,
    borderRadius: "2xl",
    bg: theme.panelBg,
    boxShadow: "md",
    overflow: "hidden",
    minH: 0,
    h: "100%",
} as const);

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
    const theme = useAppTheme();

    const onRestartVM = async () => {
        await fetch(window.location.protocol + "//" + window.location.host + "/api/vm/restart", {
            method: "POST"
        });
    }

    return (
        <Box flex="1" minH={0} h="100%" position="relative">
            <Grid
                templateColumns={fullscreen ? "1fr" : { base: "1fr", xl: "1.45fr 0.8fr" }}
                gap={fullscreen ? 0 : 4}
                minH={0}
                h={fullscreen ? "100%" : "auto"}
            >
                <Flex direction="column" {...panelStyles(theme)} borderRadius={fullscreen ? 0 : "2xl"}>
                    <PanelHeader
                        title="Framebuffer"
                        subtitle="Live display output"
                        actions={
                            <>
                                <ActionButton label="Restart" onClick={onRestartVM} disabled={!running}>
                                    <LuRotateCcw />
                                </ActionButton>
                                <ActionButton label="Stop" onClick={onStopSession} disabled={!running}>
                                    <LuSquare />
                                </ActionButton>
                                <ActionButton label="Screenshot" disabled={!running}>
                                    <LuCamera />
                                </ActionButton>
                                <ActionButton label={fullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
                                    {fullscreen ? <LuMinimize2 /> : <LuMaximize2 />}
                                </ActionButton>
                            </>
                        }
                    />

                    <Box
                        flex="1"
                        minH={fullscreen ? 0 : "320px"}
                        position="relative"
                        bg={theme.displayBg}
                        aspectRatio={fullscreen ? undefined : "16/9"}
                        h={fullscreen ? "100%" : undefined}
                    >
                        {vncUrl ? (
                            <NoVnc url={vncUrl} />
                        ) : (
                            <Flex
                                direction="column"
                                align="center"
                                justify="center"
                                h="100%"
                                color="fg.muted"
                                textAlign="center"
                                px={6}
                            >
                                <LuPlay size={48} opacity={0.5} />
                                <Heading size="md" mt={3} color="fg">
                                    No active session
                                </Heading>
                                <Text mt={1} maxW="xs">
                                    Launch a session to boot your kernel in the browser.
                                </Text>
                            </Flex>
                        )}

                        {(launching || initializing) && (
                            <Flex
                                position="absolute"
                                inset={0}
                                direction="column"
                                align="center"
                                justify="center"
                                gap={3}
                                bg={theme.overlayBg}
                                backdropFilter="blur(6px)"
                                zIndex={2}
                                textAlign="center"
                                px={6}
                            >
                                <Spinner size="xl" color="blue.400" />
                                <Heading size="sm" color="fg">
                                    {launching ? "Preparing your session" : "Checking session state"}
                                </Heading>
                                <Text color="fg.muted" maxW="xs">
                                    {launching
                                        ? "Your VM is waking up and the display will appear shortly."
                                        : "A quick status check is running in the background."}
                                </Text>
                            </Flex>
                        )}
                    </Box>
                </Flex>

                <Flex
                    direction="column"
                    {...panelStyles(theme)}
                    borderRadius={fullscreen ? "xl" : "2xl"}
                    position={fullscreen ? "absolute" : "relative"}
                    right={fullscreen ? 4 : undefined}
                    bottom={fullscreen ? 4 : undefined}
                    w={fullscreen ? { base: "calc(100% - 32px)", md: "380px" } : undefined}
                    maxH={fullscreen ? { base: "220px", md: "280px" } : undefined}
                    zIndex={fullscreen ? 3 : undefined}
                >
                    <PanelHeader
                        title="Serial Console"
                        subtitle="Kernel and debug output"
                        actions={
                            <Badge
                                variant="subtle"
                                colorPalette={running ? "green" : "gray"}
                                borderRadius="full"
                                px={2.5}
                                py={0.5}
                            >
                                <HStack gap={2}>
                                    <Box
                                        boxSize="2"
                                        borderRadius="full"
                                        bg={running ? "green.400" : "gray.500"}
                                    />
                                    <Text as="span">{running ? "Connected" : "Disconnected"}</Text>
                                </HStack>
                            </Badge>
                        }
                    />

                    <Box
                        position="relative"
                        flex="1"
                        minH={{ base: "150px", md: "220px" }}
                        overflow="hidden"
                        bg={theme.terminalBg}
                    >
                        <SerialTerminal serialUrl={serialUrl} />

                        {!serialUrl && !launching && (
                            <Placeholder>
                                Serial output will appear here once the session is running.
                            </Placeholder>
                        )}

                        {launching && (
                            <Placeholder>
                                <Box as="span" css={spin}>
                                    <LuLoaderCircle />
                                </Box>
                                <Text>Waiting for serial output…</Text>
                            </Placeholder>
                        )}
                    </Box>
                </Flex>
            </Grid>
        </Box>
    );
}

function PanelHeader({
    title,
    subtitle,
    actions,
}: {
    title: string;
    subtitle: string;
    actions: React.ReactNode;
}) {
    const theme = useAppTheme();

    return (
        <Flex
            justify="space-between"
            align="center"
            px={4}
            py={3.5}
            borderBottomWidth="1px"
            borderColor={theme.panelBorder}
            bg={theme.headerBg}
        >
            <Box>
                <Heading size="sm">{title}</Heading>
                <Text color="fg.muted" fontSize="sm">{subtitle}</Text>
            </Box>
            <HStack gap={2}>{actions}</HStack>
        </Flex>
    );
}

function ActionButton({
    label,
    onClick,
    disabled,
    children,
}: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Tooltip content={label}>
            <IconButton
                aria-label={label}
                variant="subtle"
                size="sm"
                onClick={onClick}
                disabled={disabled}
            >
                {children}
            </IconButton>
        </Tooltip>
    );
}

function Placeholder({ children }: { children: React.ReactNode }) {
    const theme = useAppTheme();

    return (
        <Flex
            position="absolute"
            inset={4}
            align="center"
            justify="center"
            gap={2}
            color="fg.muted"
            borderWidth="1px"
            borderStyle="dashed"
            borderColor={theme.panelBorder}
            borderRadius="xl"
            textAlign="center"
            pointerEvents="none"
            zIndex={1}
        >
            {children}
        </Flex>
    );
}
