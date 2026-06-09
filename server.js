const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // Allows your GitHub pages frontend to talk to this server

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://kinanx7.github.io/mafia/", // Replace "*" with your GitHub Pages URL later for security
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle a player joining or creating a room
    socket.on('join_room', (roomCode, playerName) => {
        socket.join(roomCode);
        console.log(`${playerName} joined room: ${roomCode}`);
        
        // Tell everyone else in the room that someone joined
        socket.to(roomCode).emit('player_joined', { id: socket.id, name: playerName });
    });

    // Handle game actions (votes, night targets, chat)
    socket.on('game_action', (data) => {
        // Broadcast the action to everyone in that specific room
        io.to(data.roomCode).emit('update_state', data.payload);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // You can add logic here to notify the room if a player drops
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Mafia backend running on port ${PORT}`);
});
