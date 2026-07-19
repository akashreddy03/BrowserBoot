import { useEffect, useRef, useState, type DragEvent } from "react";
import {
    Badge,
    Box,
    Button,
    Dialog,
    Field,
    Grid,
    Group,
    HStack,
    IconButton,
    Input,
    NativeSelect,
    Separator,
    Stack,
    Text,
} from "@chakra-ui/react";
import { LuLock, LuUpload, LuX } from "react-icons/lu";

export interface BootOptionsConfig {
    ram: string;
    disk: string;
    cpu: number;
    image: string;
}

interface BootOptionsProps {
    visible: boolean;
    initial: BootOptionsConfig;
    onChange: (opts: BootOptionsConfig) => void;
    onCancel: () => void;
    onConfirm: (opts: BootOptionsConfig) => void;
}

const DEFAULT_IMAGES = [
    { value: "alpine-std.qcow2", label: "Alpine Linux (x86_64)" },
    { value: "kernel.iso", label: "Generic kernel ISO" },
] as const;

const IMAGE_EXTENSIONS = [".iso", ".qcow2"];

function isBootImageFile(file: File) {
    const name = file.name.toLowerCase();
    return IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function BootOptions({
    visible,
    initial,
    onChange,
    onCancel,
    onConfirm,
}: BootOptionsProps) {
    const [opts, setOpts] = useState(initial);
    const [customFile, setCustomFile] = useState<File | null>(null);
    const [imageSource, setImageSource] = useState<"preset" | "custom">("preset");
    const [dragging, setDragging] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (visible) {
            setOpts(initial);
            setCustomFile(null);
            setImageSource(
                DEFAULT_IMAGES.some((img) => img.value === initial.image) ? "preset" : "custom",
            );
            setFileError(null);
        }
    }, [visible, initial]);

    const update = (patch: Partial<BootOptionsConfig>) => {
        const next = { ...opts, ...patch, cpu: 1 };
        setOpts(next);
        onChange(next);
    };

    const selectPreset = (image: string) => {
        setImageSource("preset");
        setCustomFile(null);
        setFileError(null);
        update({ image });
    };

    const selectCustomFile = (file: File) => {
        if (!isBootImageFile(file)) {
            setFileError("Use an ISO, QCOW2 file.");
            return;
        }

        setImageSource("custom");
        setCustomFile(file);
        setFileError(null);
        update({ image: file.name });
    };

    const clearCustomFile = () => {
        setCustomFile(null);
        setFileError(null);
        selectPreset(DEFAULT_IMAGES[0].value);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) selectCustomFile(file);
    };

    const presetValue = DEFAULT_IMAGES.some((img) => img.value === opts.image)
        ? opts.image
        : DEFAULT_IMAGES[0].value;

    return (
        <Dialog.Root
            open={visible}
            placement="center"
            onOpenChange={(details) => {
                if (!details.open) onCancel();
            }}
        >
            <Dialog.Backdrop />
            <Dialog.Positioner px={4}>
                <Dialog.Content maxW="lg" w="full">
                    <Dialog.Header pb={2} spaceY={0}>
                        <Dialog.Title>Boot Options</Dialog.Title>
                        <Dialog.Description fontSize="sm">
                            Configure VM resources and choose a boot image.
                        </Dialog.Description>
                    </Dialog.Header>

                    <Dialog.Body>
                        <Stack gap={5}>
                            <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
                                <Field.Root w="full">
                                    <Field.Label>Memory</Field.Label>
                                    <NativeSelect.Root w="full">
                                        <NativeSelect.Field
                                            value={opts.ram}
                                            onChange={(e) => update({ ram: e.currentTarget.value })}
                                        >
                                            <option value="256M">256 MB</option>
                                            <option value="512M">512 MB</option>
                                            <option value="1G">1 GB</option>
                                            <option value="2G">2 GB</option>
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator />
                                    </NativeSelect.Root>
                                </Field.Root>

                                <Field.Root w="full">
                                    <Field.Label>Disk</Field.Label>
                                    <NativeSelect.Root w="full">
                                        <NativeSelect.Field
                                            value={opts.disk}
                                            onChange={(e) => update({ disk: e.currentTarget.value })}
                                        >
                                            <option value="1G">1 GB</option>
                                            <option value="2G">2 GB</option>
                                            <option value="4G">4 GB</option>
                                            <option value="8G">8 GB</option>
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator />
                                    </NativeSelect.Root>
                                </Field.Root>
                            </Grid>

                            <Field.Root>
                                <Field.Label>CPU</Field.Label>
                                <Input
                                    value="1 vCPU"
                                    readOnly
                                    disabled
                                    bg="bg.subtle"
                                />
                                <Field.HelperText>
                                    <HStack gap={1.5} color="fg.muted">
                                        <LuLock size={14} />
                                        <Text fontSize="sm">Locked to 1 core</Text>
                                    </HStack>
                                </Field.HelperText>
                            </Field.Root>

                            <Separator />

                            <Stack gap={3}>
                                <Field.Root w="full">
                                    <Field.Label>Default images</Field.Label>
                                    <NativeSelect.Root w="full">
                                        <NativeSelect.Field
                                            value={presetValue}
                                            onChange={(e) => selectPreset(e.currentTarget.value)}
                                        >
                                            {DEFAULT_IMAGES.map((img) => (
                                                <option key={img.value} value={img.value}>
                                                    {img.label}
                                                </option>
                                            ))}
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator />
                                    </NativeSelect.Root>
                                    <Field.HelperText>
                                        Images readily available.
                                    </Field.HelperText>
                                </Field.Root>

                                <Field.Root invalid={!!fileError} w="full">
                                    <Field.Label>Custom image</Field.Label>
                                    <Box
                                        w="full"
                                        borderWidth="2px"
                                        borderStyle="dashed"
                                        borderColor={dragging ? "blue.400" : fileError ? "red.400" : "border.emphasized"}
                                        borderRadius="xl"
                                        bg={dragging ? { base: "blue.50", _dark: "blue.950" } : "bg.subtle"}
                                        p={5}
                                        textAlign="center"
                                        transition="border-color 0.15s, background 0.15s"
                                        onDragOver={(event) => {
                                            event.preventDefault();
                                            setDragging(true);
                                        }}
                                        onDragLeave={() => setDragging(false)}
                                        onDrop={handleDrop}
                                    >
                                        <Stack gap={3} align="center">
                                            <Box color="blue.400">
                                                <LuUpload size={28} />
                                            </Box>
                                            <Stack gap={1}>
                                                <Text fontWeight="medium">
                                                    Drop ISO, QCOW2, or other disk images here
                                                </Text>
                                                <Text fontSize="sm" color="fg.muted">
                                                    Supports .iso, .qcow2
                                                </Text>
                                            </Stack>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Browse files
                                            </Button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                hidden
                                                accept={IMAGE_EXTENSIONS.join(",")}
                                                onChange={(event) => {
                                                    const file = event.target.files?.[0];
                                                    if (file) selectCustomFile(file);
                                                    event.target.value = "";
                                                }}
                                            />
                                        </Stack>
                                    </Box>

                                    {customFile && imageSource === "custom" && (
                                        <HStack
                                            mt={3}
                                            p={3}
                                            borderWidth="1px"
                                            borderColor="border.emphasized"
                                            borderRadius="lg"
                                            bg="bg.muted"
                                            justify="space-between"
                                        >
                                            <Stack gap={0.5} align="flex-start">
                                                <HStack gap={2}>
                                                    <Badge colorPalette="blue" variant="subtle">
                                                        Custom
                                                    </Badge>
                                                    <Text fontWeight="medium" fontSize="sm">
                                                        {customFile.name}
                                                    </Text>
                                                </HStack>
                                                <Text fontSize="xs" color="fg.muted">
                                                    {formatFileSize(customFile.size)}
                                                </Text>
                                            </Stack>
                                            <IconButton
                                                aria-label="Remove custom image"
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearCustomFile}
                                            >
                                                <LuX />
                                            </IconButton>
                                        </HStack>
                                    )}

                                    {fileError && <Field.ErrorText>{fileError}</Field.ErrorText>}
                                </Field.Root>
                            </Stack>
                        </Stack>
                    </Dialog.Body>

                    <Dialog.Footer>
                        <Group gap={2} w="full" justify="flex-end">
                            <Button variant="ghost" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button
                                colorPalette="blue"
                                onClick={() => onConfirm({ ...opts, cpu: 1 })}
                                disabled={imageSource === "custom" && !customFile && !opts.image}
                            >
                                Launch
                            </Button>
                        </Group>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}
