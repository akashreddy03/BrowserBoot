import {
    Badge,
    Box,
    Button,
    Flex,
    Group,
    Heading,
    HStack,
    Text,
} from "@chakra-ui/react";
import { LuPlay } from "react-icons/lu";
import { ColorModeButton } from "./ui/color-mode";
import { useAppTheme } from "../hooks/useAppTheme";

interface AppHeaderProps {
    onLaunchSession: () => void;
    running: boolean;
    sessionId: string;
    fullscreen: boolean;
    launching: boolean;
}

export default function AppHeader({ onLaunchSession, running, sessionId, fullscreen, launching }: AppHeaderProps) {
    const theme = useAppTheme();

    return (
        <Flex
            as="header"
            align="center"
            justify="space-between"
            gap={4}
            px={4}
            py={fullscreen ? 2.5 : 3}
            borderWidth="1px"
            borderColor={theme.panelBorder}
            borderRadius={fullscreen ? "lg" : "2xl"}
            bg={theme.headerBg}
            backdropFilter="blur(20px)"
            boxShadow="sm"
        >
            <Box>
                <HStack gap={2.5}>
                    <Box
                        boxSize="2.5"
                        borderRadius="full"
                        bgGradient="to-br"
                        gradientFrom="blue.400"
                        gradientTo="cyan.400"
                        boxShadow="0 0 0 4px rgba(96, 165, 250, 0.16)"
                    />
                    <Heading size={fullscreen ? "sm" : "md"} letterSpacing="tight">
                        BrowserBoot
                    </Heading>
                </HStack>
                {!fullscreen && (
                    <Text color="fg.muted" fontSize="sm" mt={1}>
                        Boot and test your operating system directly from your browser.
                    </Text>
                )}
            </Box>

            <Group gap={2}>
                <ColorModeButton variant="subtle" borderRadius="full" />

                <Badge
                    variant="subtle"
                    colorPalette={running ? "green" : "gray"}
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="medium"
                >
                    <HStack gap={2}>
                        <Box
                            boxSize="2"
                            borderRadius="full"
                            bg={running ? "green.400" : "gray.500"}
                            boxShadow={running ? "0 0 0 3px rgba(34, 197, 94, 0.2)" : undefined}
                        />
                        <Text as="span">{running ? `Session ${sessionId.slice(0, 8)}` : "Ready to launch"}</Text>
                    </HStack>
                </Badge>

                <Button
                    colorPalette="blue"
                    borderRadius="full"
                    onClick={onLaunchSession}
                    disabled={running || launching}
                    loading={launching}
                    loadingText="Launching..."
                >
                    <LuPlay />
                    Launch Session
                </Button>
            </Group>
        </Flex>
    );
}
