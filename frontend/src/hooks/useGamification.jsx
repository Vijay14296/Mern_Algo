import { useEffect, useState } from "react";
import { io } from "socket.io-client";

let socket;

export const useGamification = (userId) => {
  const [gamification, setGamification] = useState({
    xp: 0,
    level: 0,
    badges: [],
    streak: 0,
    problemsSolved: 0,
    problemStats: {},
  });

  useEffect(() => {
    if (!userId) {
      console.log("[GamificationHook] ❌ No userId provided, skipping socket connection");
      return;
    }

    // Connect only once
    if (!socket) {
      console.log("[GamificationHook] 🔹 Creating new Socket.IO connection...");
      socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000");

      socket.on("connect", () => {
        console.log("[GamificationHook] ⚡ Socket connected:", socket.id);
      });

      socket.on("connect_error", (err) => {
        console.error("[GamificationHook] ❌ Socket connection error:", err);
      });

      socket.on("disconnect", (reason) => {
        console.warn("[GamificationHook] ⚠️ Socket disconnected:", reason);
      });
    } else {
      console.log("[GamificationHook] 🔹 Using existing socket:", socket.id);
    }

    // Join room for this user
    console.log(`[GamificationHook] 🟢 Joining room for user: ${userId}`);
    socket.emit("joinRoom", userId);

    // Listen for updates
    socket.on("gamificationUpdate", (data) => {
      console.log("🔔 [GamificationHook] Gamification update received:", data);
      setGamification(data);
    });

    return () => {
      console.log("[GamificationHook] 🛑 Cleaning up gamificationUpdate listener");
      socket.off("gamificationUpdate");
    };
  }, [userId]);

  return gamification;
};
