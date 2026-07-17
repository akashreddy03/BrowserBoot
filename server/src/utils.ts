import net from "net";

export async function waitForPort(
    port: number,
    host = "127.0.0.1",
    timeout = 3000
): Promise<void> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
        const isOpen = await new Promise<boolean>((resolve) => {
            const socket = new net.Socket();

            socket.setTimeout(500);

            socket.once("connect", () => {
                socket.destroy();
                resolve(true);
            });

            socket.once("error", () => {
                socket.destroy();
                resolve(false);
            });

            socket.once("timeout", () => {
                socket.destroy();
                resolve(false);
            });

            socket.connect(port, host);
        });

        if (isOpen) {
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Timed out waiting for ${host}:${port}`);
}