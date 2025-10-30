import { useState } from "react";
import { useChat } from "../../context/ChatContext";
import type { MessageType } from "../../types/chattypes";

const MessageInput = () => {
  const [text, setText] = useState("");
  const { selectedUser, currentUser, socket, setMessages } = useChat();

  const handleSend = () => {
    if (!text.trim() || !selectedUser || !currentUser) return;

    // Prevent sending messages to self
    if (selectedUser.id === currentUser.id) {
      console.warn("Cannot send messages to yourself");
      return;
    }

    // Ensure we're working with numbers for IDs
    const messageId = `${currentUser.id}-${selectedUser.id}-${Date.now()}`;
    const newMessage: MessageType = {
      id: messageId,
      sender_id: Number(currentUser.id),
      receiver_id: Number(selectedUser.id),
      content: text,
      timestamp: new Date().toISOString(),
    };
    
    console.log("📤 Sending message:", {
      id: messageId,
      sender: currentUser.username,
      receiver: selectedUser.username,
      content: text
    });

    // Send to backend via WebSocket if connected
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log("Sending message:", newMessage);
      
      // Create message object for backend
      const messageForBackend = {
        sender_id: Number(currentUser.id),
        receiver_id: Number(selectedUser.id),
        content: text.trim(),
        room_id: `${Math.min(currentUser.id, selectedUser.id)}-${Math.max(currentUser.id, selectedUser.id)}`,
      };
      
      // Send message to backend
      socket.send(JSON.stringify(messageForBackend));
      
      // Optimistically add message to UI
      setMessages(prevMessages => {
        const chatId = `${Math.min(currentUser.id, selectedUser.id)}-${Math.max(currentUser.id, selectedUser.id)}`;
        const currentMessages = prevMessages[chatId] || [];
        return {
          ...prevMessages,
          [chatId]: [...currentMessages, newMessage]
        };
      });
    } else {
      console.warn("⚠️ WebSocket not connected");
    }

    setText("");
  };

  return (
    <div className="flex gap-2 p-2 border-t bg-white">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border px-3 py-2 rounded"
        placeholder={
          selectedUser
            ? `Message ${selectedUser.username}...`
            : "Select a contact to start chatting"
        }
        disabled={!selectedUser}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        onClick={handleSend}
        disabled={!selectedUser || !text.trim()}
        className={`px-4 py-2 rounded text-white ${
          selectedUser && text.trim()
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
