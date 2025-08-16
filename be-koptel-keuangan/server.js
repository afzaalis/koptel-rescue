require('dotenv').config(); 

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app'); 
const pool = require('./src/db'); 
const salesController = require('./src/controllers/salesController'); 

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.BASE_URL || 'http://10.64.210.66:3000', 
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "DELETE"] 
    }
});

// Set instance Socket.IO ke aplikasi Express agar bisa diakses oleh controller
app.set('socketio', io);

// Event listener untuk koneksi Socket.IO
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    // Emit data dashboard saat pengguna terhubung
    salesController.emitDashboardDataUpdate(io); 
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Fungsi untuk menguji koneksi database dan memulai server
async function startServer() {
    try {
        await pool.query('SELECT 1');
        console.log('Connected to NeonDB.');

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Access dashboard data at http://localhost:${PORT}/api/sales/dashboard`);
        });

        // setInterval(() => {
        //     salesController.emitDashboardDataUpdate(io);
        // }, 60000); // Emit setiap 60 detik (1 menit)

    } catch (err) {
        console.error('Failed to connect to NeonDB or start server:', err);
        console.error('Error details:', err.message);
        process.exit(1);
    }
}

startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end(() => { 
            console.log('PostgreSQL client pool has ended');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end(() => { 
            console.log('PostgreSQL client pool has ended');
            process.exit(0);
        });
    });
});
