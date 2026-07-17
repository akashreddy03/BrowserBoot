import { createWebSocketStream, WebSocketServer } from 'ws';
import net from 'net';
import type SessionManager from './services/SessionManager.js';
import { WebSocket } from 'ws';
import type { Session } from './types/Session.js';

export default function setupWebsockets(server: any, sessionManager: typeof SessionManager) {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        const sessionId = req.url?.split('/').pop();

        if (!sessionId) {
            ws.close(1008, 'Session ID is required');
            return;
        }
        
        const session = sessionManager.getSession(sessionId);

        if (!session) {
            ws.close(1008, 'Session not found');
            return;
        }

        if(req.url?.includes('/ws/serial/' + session.id)) {
            handleSerial(ws, session);
        }

        if(req.url?.includes('/ws/vnc/' + session.id)) {
            handleVnc(ws, session);
        }
        
    });


};

function handleVnc(client: WebSocket, session: Session) {

    if (!session.vm?.vncPort) {
            client.close(1008, 'Serial port not available for this session');
            return;
    };

    const qemu = new WebSocket(`ws://127.0.0.1:${session.vm?.vncPort-200}`);
        
    const browserStream = createWebSocketStream(client);
    const qemuStream = createWebSocketStream(qemu);

    browserStream.pipe(qemuStream);
    qemuStream.pipe(browserStream);

    browserStream.on('close', () => {
        qemu.close();
        qemuStream.end()
    });
    qemuStream.on('close', () => {
        client.close();
        browserStream.end()
    });

    qemuStream.on('error', () => {
        client.close();
        browserStream.destroy();
    })

    browserStream.on('error', () => {
        qemu.close();
        qemuStream.destroy();
    })

}


function handleSerial(ws: WebSocket, session: Session) {

    if (!session.vm?.serialPort) {
            ws.close(1008, 'Serial port not available for this session');
            return;
    };

    const socket = net.createConnection({ host: "127.0.0.1", port: session.vm?.serialPort });
        
    socket.on('data', (data) => {
        ws.send(data.toString());
    });

    socket.on('end', () => {
        ws.close(1000, 'Serial connection closed');
    });

    socket.on('error', (err) => {
        ws.close(1011, 'Socket error');
    });
    
    ws.on('message', (data) => {
        socket.write(data.toString());
    });

    ws.on('close', () => {
        socket.destroy();
    });

}
