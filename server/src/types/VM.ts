import { ChildProcess } from 'child_process';

export interface VM {
    qmpSock: string;
    vncPort: number;
    serialPort: number;
    pid: number;
    process: ChildProcess;
}