import { spawn } from "child_process";
import type { VM } from "../types/VM.js";
import type { BootOptions } from "../types/Session.js";
import { waitForPort } from "../utils.js";
import QMPClient from "./QMPClient.js";
import QemuLauncher from "./QemuLauncher.js";
import path from "path";
import fs from "fs";

class VMManager {

    private vms = new Map<string, VM>();

    readonly VNC_BASE_PORT = 5900;
    private readonly SERIAL_BASE_PORT = 6000;

    private readonly PORT_LIMIT = 10;

    private readonly IMAGES_DIR = "../images";

    async start(sessionId: string, bootOptions?: BootOptions): Promise<VM> {
        const { vncPort, serialPort } = this.allocatePorts();

        const qmpSock = path.resolve("../runtime/qmp/" + sessionId + ".sock");
        const qcow2disk = path.resolve("../runtime/qcow2/" + sessionId + ".qcow2");

        // Default to alpine-std.qcow2 if no image specified
        const imageFile = bootOptions?.image ?? "alpine-std.qcow2";
        const bootImage = path.resolve(path.join(process.cwd(), this.IMAGES_DIR), imageFile);
        console.log("BOOT IMAGE: ", bootImage);
        const imageType = this.getImageType(bootImage);
        console.log("IMAGE TYPE: ", imageType);
        console.log("QCOW2DISK: ", qcow2disk);

        const diskSize = bootOptions?.disk ?? "2G";
        await this.createDisk(qcow2disk, bootImage, imageType, diskSize);

        const qemuProcess = QemuLauncher.launch(
            qmpSock,
            vncPort,
            serialPort,
            this.VNC_BASE_PORT,
            bootImage,
            qcow2disk,
            bootOptions?.ram ?? "512M",
            bootOptions?.cpu ?? 1,
        );

        const vm: VM = {
            qmpSock,
            vncPort,
            serialPort,
            qcow2disk,
            pid: qemuProcess.pid!,
            process: qemuProcess
        };

        this.vms.set(sessionId, vm);

        await waitForPort(vncPort);
        await waitForPort(serialPort);

        return vm;
    };

    private getImageType(imageFile: string): string {
        if (imageFile.endsWith('.iso')) return 'iso';
        if (imageFile.endsWith('.qcow2')) return 'qcow2';
        throw new Error("Unknown image type: " + imageFile);
    }

    async deleteDisk(qcow2disk: string) {
        await fs.unlink(qcow2disk, (err) => {
            if(err) console.log("Couldn't delete the disk file: ", qcow2disk);
        });
    }

    async createDisk(qcow2disk: string, imageFile: string, imageType: string, diskSize: string = "2G") {
        return new Promise<void>((resolve, reject) => {
            const args: string[] = ["create", "-f", "qcow2"];

            console.log(imageType);

            if (imageType === 'iso') {
                args.push(qcow2disk, diskSize);
            } else if (imageType === 'qcow2') {
                args.push("-F", "qcow2", "-b", imageFile, qcow2disk);
            } else {
                reject(new Error("Invalid Image Type"));
                return;
            }

            const p = spawn("qemu-img", args);

            p.on("exit", (code) => {
                if (code === 0) resolve();
                else reject(new Error("Failed to create qcow2"));
            });

            p.on("error", reject);
        });
    }

    async stop(sessionId: string) {
        const vm = this.vms.get(sessionId);
        if (!vm) throw new Error("VM not found for session: " + sessionId);
        vm.process.kill();
        this.vms.delete(sessionId);
        await this.deleteDisk(vm.qcow2disk);
    };

    async restartVM(sessionId: string) {
        const vm = this.vms.get(sessionId);
        if (!vm) throw new Error("VM not found for session: " + sessionId);

        QMPClient.restart(vm.qmpSock);
    }

    private isPortInUse(port: number): boolean {
        for (const vm of this.vms.values()) {
            if (vm.vncPort === port || vm.serialPort === port) {
                return true;
            }
        }
        return false;
    }

    private allocatePorts(): { vncPort: number, serialPort: number } {
        for (let i = 0; i < this.PORT_LIMIT; i++) {
            const vncPort = this.VNC_BASE_PORT + i;
            const serialPort = this.SERIAL_BASE_PORT + i;

            if (!this.isPortInUse(vncPort) && !this.isPortInUse(serialPort)) {
                return { vncPort, serialPort };
            }
        }
        throw new Error("No available ports for VM");
    }
};

export default new VMManager();