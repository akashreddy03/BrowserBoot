import { Badge, Grid, HStack, Text } from "@chakra-ui/react";
import { LuActivity } from "react-icons/lu";
import { useAppTheme } from "../hooks/useAppTheme";

interface StatusBarProps {
    sessionId: string;
    running: boolean;
}

const statItems = [
    { label: "Session", value: (sessionId: string) => sessionId },
    { label: "Resolution", value: () => "1024 × 768" },
    { label: "Memory", value: () => "512 MB" },
    { label: "CPU", value: () => "1 vCPU" },
] as const;

export default function StatusBar({ sessionId, running }: StatusBarProps) {
    return (
        <Grid
            templateColumns="repeat(auto-fit, minmax(150px, 1fr))"
            gap={3}
        >
            {statItems.slice(0, 1).map(({ label, value }) => (
                <StatusCard key={label} label={label} value={value(sessionId)} />
            ))}

            <StatusCard label="Status">
                <Text>{running ? "Running" : "Stopped"}</Text>
            </StatusCard>

            {statItems.slice(1).map(({ label, value }) => (
                <StatusCard key={label} label={label} value={value(sessionId)} />
            ))}

            <StatusCard label="Resources">
                <HStack gap={2} color="green.300" fontWeight="semibold">
                    <LuActivity />
                    <Text>Healthy</Text>
                </HStack>
            </StatusCard>
        </Grid>
    );
}

function StatusCard({
    label,
    value,
    children,
}: {
    label: string;
    value?: string;
    children?: React.ReactNode;
}) {
    const theme = useAppTheme();

    return (
        <Grid
            gap={2}
            p={4}
            borderWidth="1px"
            borderColor={theme.panelBorder}
            borderRadius="xl"
            bg={theme.cardBg}
            transition="border-color 0.2s"
            _hover={{ borderColor: "blue.400/40" }}
        >
            <Text
                color="fg.muted"
                fontSize="xs"
                fontWeight="medium"
                textTransform="uppercase"
                letterSpacing="wider"
            >
                {label}
            </Text>
            {children ?? (
                <Text fontWeight="semibold" truncate>
                    {value}
                </Text>
            )}
        </Grid>
    );
}
