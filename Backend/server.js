const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const apiRoutes = require('./routes/api');
const telemetrySocket = require('./sockets/telemetry');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // In production, replace with your frontend URL
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Socket.io initialization
telemetrySocket(io);

// Health Check
app.get('/', (req, res) => {
    res.json({ status: 'Revora Backend Operational', version: '4.4.1' });
});

server.listen(PORT, () => {
    console.log(`[Server] Revora High-Performance Backend running on http://localhost:${PORT}`);
    console.log(`[Socket] WebSocket server active for real-time telemetry.`);
});
