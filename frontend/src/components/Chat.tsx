import React, { useEffect, useState, useRef } from "react";

interface Message {
  username: string;
  content: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // connect to Go backend WebSocket
    const socket = new WebSocket(`ws://localhost:8080/ws?token=${token}`);
    socketRef.current = socket;

    socket.onopen = () => console.log("✅ Connected to WebSocket");

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };

    socket.onclose = () => console.log("❌ Disconnected");

    return () => socket.close();
  }, []);

  const sendMessage = () => {
    if (socketRef.current && input.trim() !== "") {
      socketRef.current.send(JSON.stringify({ content: input }));
      setInput("");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-xl font-bold mb-3">💬 Chat Room</h2>
      <div className="border w-80 h-96 p-2 overflow-y-auto bg-gray-100 rounded">
        {messages.map((msg, i) => (
          <p key={i}>
            <strong>{msg.username}: </strong> {msg.content}
          </p>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          className="border p-2 rounded w-64"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>

      <button onClick={logout} className="text-sm text-red-500 mt-4">
        Logout
      </button>
    </div>
  );
};

export default Chat;
