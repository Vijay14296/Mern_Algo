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
    console.log("🟢 Client connected:", socket.id);

    socket.on("joinRoom", (userId) => {
      socket.join(userId);
      console.log(`🟢 Socket ${socket.id} joined room ${userId}`);
    });

    socket.on("disconnect", () =>
      console.log("🔴 Client disconnected:", socket.id)
    );
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("❌ Socket.IO not initialized!");
  }
  return io;
};
