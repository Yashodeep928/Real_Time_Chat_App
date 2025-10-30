// src/services/socket.ts
export const connectSocket = (token: string): WebSocket => {
  const socket = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

  socket.onopen = () => console.log("✅ WebSocket connected");
  socket.onclose = () => console.log("❌ WebSocket disconnected");
  socket.onerror = (err) => console.error("⚠️ WebSocket error:", err);

  return socket;
};
