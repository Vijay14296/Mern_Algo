// config/socket.js
import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ New client connected:", socket.id);

    socket.on("joinRoom", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their gamification room`);
    });

    socket.on("disconnect", () => {
      console.log("⚡ Client disconnected:", socket.id);
    });
  });

  console.log("✅ Socket.IO initialized");
};

// Optional: helper to emit events from other modules (like worker)
export const emitToUser = (userId, event, data) => {
  if (io) {
    console.log(`🔹 [Socket.IO] Emitting event "${event}" to user ${userId}`, data);
    io.to(userId).emit(event, data);
  } else {
    console.warn("⚠️ Socket.IO not initialized yet");
  }
};

