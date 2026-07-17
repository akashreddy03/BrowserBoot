import express from 'express';
import cors from 'cors';
import sessionRoutes from './routes/session.routes.js';
import vmRoutes from './routes/vm.routes.js';
import http from 'http';
import setupWebsockets from './websocket.js';
import sessionManager from './services/SessionManager.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/api/session', sessionRoutes);
app.use('/api/vm', vmRoutes);

app.get('/api/health', (_, res) => {
    res.json({ status: 'running' });
});

const server = http.createServer(app);

setupWebsockets(server, sessionManager);

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});