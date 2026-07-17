import net from "net";
import { json } from "stream/consumers";

class QMPClient {

    async connect(sock: string) {
        const qmp = net.createConnection(sock);
        qmp.write(JSON.stringify({ execute: "qmp_capabilities" }));
        return qmp;
    }

    async restart(sock: string) {
        let buffer = "";
        const qmp = await this.connect(sock);
        qmp.on('data', (data) => {
            buffer += data.toString();
        })
        qmp.write(JSON.stringify({ execute: "system_reset" }));
        qmp.end();
    }

    close() {}
}

export default new QMPClient();