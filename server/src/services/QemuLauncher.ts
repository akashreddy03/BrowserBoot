import { spawn, type ChildProcess } from "child_process";

class QemuLauncher {

    launch(
        qmpSock: string,
        vncPort: number,
        serialPort: number,
        vncBasePort: number,
        imageFile: string,
        qcow2Disk: string
    ): ChildProcess {

        const args = [
            "-m", "512M",
            "-serial", `tcp:127.0.0.1:${serialPort},server=on,nowait`,
            "-vnc", `:${vncPort - vncBasePort},websocket=on`,
            "-qmp", `unix:${qmpSock},server=on,wait=off`,
            ...this.buildArgs(imageFile, qcow2Disk)
        ];

        const qemuProcess = spawn('qemu-system-x86_64', args);

        if (!qemuProcess.pid) {
            throw new Error("Failed to start VM");
        }

        qemuProcess.stderr.on('data', (data) => console.log(data.toString()));
        qemuProcess.stdout.on('data', (data) => console.log(data.toString()));

        return qemuProcess;
    }

    private buildArgs(imageFile: string, qcow2Disk: string): string[] {
        const args: string[] = [];

        if (imageFile.endsWith('.iso')) {
            // Mount the qcow2 disk as the main drive
            args.push("-drive", `file=${qcow2Disk},if=virtio,format=qcow2`);
            // Mount the ISO as a CD-ROM and boot from it
            args.push("-cdrom", imageFile);
            // Boot from CD-ROM first
            args.push("-boot", "d");
        } else if (imageFile.endsWith('.qcow2')) {
            // Mount the qcow2 disk as the main drive (backed by the image)
            args.push("-drive", `file=${qcow2Disk},if=virtio,format=qcow2`);
        } else {
            throw new Error("Invalid image file received by Launcher");
        }

        return args;
    }
}

export default new QemuLauncher();