module.exports = (io) => {
    let rpm = 0;
    let efficiency = 94.2;
    let maxPower = 700;

    // Simulate real-time data fluctuations
    setInterval(() => {
        // RPM fluctuates between 8500 and 9200
        rpm = Math.floor(Math.random() * (9200 - 8500) + 8500);
        
        // Efficiency oscillates around 94-96%
        efficiency = (94 + Math.random() * 2).toFixed(2);
        
        // Power varies by load simulation
        let power = Math.floor(680 + Math.random() * 25);

        // Broadcast to all connected clients
        io.emit('telemetry', {
            rpm: rpm,
            efficiency: efficiency,
            power: power,
            timestamp: new Date().toLocaleTimeString()
        });
    }, 2000); // Send every 2 seconds

    io.on('connection', (socket) => {
        console.log(`[Socket] New client connected: ${socket.id}`);
        
        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });
};
