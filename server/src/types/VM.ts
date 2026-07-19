import { ChildProcess } from 'child_process';

export interface VM {
    qmpSock: string;
    vncPort: number;
    serialPort: number;
    qcow2disk: string;
    pid: number;
    process: ChildProcess;
}