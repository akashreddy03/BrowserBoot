import { spawn } from "child_process";
import type { VM } from "../types/VM.js";
import {config} from "../config.js";
import { waitForPort } from "../utils.js";
import QMPClient from "./QMPClient.js";
import process from "node:process";
import path from "path";

class VMManager {

    private vms = new Map<string, VM>();

    private readonly VNC_BASE_PORT = 5900;
    private readonly SERIAL_BASE_PORT = 6000;

    private readonly PORT_LIMIT = 10;
    
    async start(sessionId: string): Promise<VM> {
        const {vncPort, serialPort} = this.allocatePorts();

        const qmpSock = path.join(path.dirname(process.cwd()), "runtime/qmp/" + sessionId + ".sock");

        const qemuProcess = spawn('qemu-system-x86_64', [
            "-m", "256M",
            "-cdrom", `${config.kernelImage}`,
            "-serial", "tcp:127.0.0.1:" + serialPort + ",server=on,nowait",
            "-vnc", ":" + (vncPort - this.VNC_BASE_PORT) + ",websocket=on",
            "-qmp", "unix:" + qmpSock + ",server=on,wait=off",
            "-M", "acpi=off",
        ]);

        if(!qemuProcess.pid) {
            throw new Error("Failed to start VM");
        }

        const vm: VM = {
            qmpSock,  
            vncPort,
            serialPort,
            pid: process.pid,
            process: qemuProcess
        };

        this.vms.set(sessionId, vm);

        await waitForPort(vncPort);
        await waitForPort(serialPort);

        return vm;
    };

    async stop(sessionId: string) {
        const vm = this.vms.get(sessionId);
        if(!vm) throw new Error("VM not found for session: " + sessionId);
        vm.process.kill();
        this.vms.delete(sessionId);
    };

    async restartVM(sessionId: string) {
        const vm = this.vms.get(sessionId);
        if(!vm) throw new Error("VM not found for session: " + sessionId);

        QMPClient.restart(vm.qmpSock);
    }    

    private isPortInUse(port: number): boolean {
        for (const vm of this.vms.values()) {
            if (vm.vncPort === port || vm.serialPort === this.VNC_BASE_PORT - port + this.SERIAL_BASE_PORT) {
                return true;
            }
        }
        return false;
    }

    private allocatePorts(): { vncPort: number, serialPort: number } {
        for(let i = 0; i < this.PORT_LIMIT; i++) {
            const vncPort = this.VNC_BASE_PORT + i;
            const serialPort = this.SERIAL_BASE_PORT + i;

            if(!this.isPortInUse(vncPort)) {
                return { vncPort, serialPort };
            }
        }
        throw new Error("No available ports for VM");
    }

};  

export default new VMManager();