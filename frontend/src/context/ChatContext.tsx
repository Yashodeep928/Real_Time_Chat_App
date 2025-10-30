import React, { createContext, useContext, useState, useEffect } from "react";
import type { ChatContextType, ChatUser, MessageType } from "../types/chattypes";

// Helper function to generate a consistent chat ID for two users
const getChatId = (user1Id: number, user2Id: number): string => {
  // Always use the smaller ID first to ensure consistency
  const [smallerId, largerId] = [user1Id, user2Id].sort((a, b) => a - b);
  return `${smallerId}-${largerId}`;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: MessageType[] }>({});
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // ✅ Initialize WebSocket connection
  useEffect(() => {
    if (!currentUser?.id) {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      return;
    }

    const connectWebSocket = () => {
      console.log("Attempting to connect WebSocket for user:", currentUser);
      const ws = new WebSocket(`ws://localhost:8080/ws?user_id=${currentUser.id}`);
      
      ws.onopen = () => {
        console.log("✅ WebSocket connected for user:", currentUser.id);
        setSocket(ws);
        
        // Send a test message to verify connection
        const testMsg = {
          type: "ping",
          userId: currentUser.id,
          timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(testMsg));
      };
      
      ws.onclose = (event) => {
        console.log("❌ WebSocket disconnected:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          userId: currentUser.id
        });
        setSocket(null);
        // Try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
      
      ws.onerror = (err) => {
        console.error("⚠️ WebSocket error for user:", currentUser.id, err);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("📨 Received message:", message);
          
          // Validate message structure
          if (!message || !message.sender_id || !message.receiver_id || !message.content) {
            console.error("Invalid message structure:", message);
            return;
          }

          // Only process messages that are meant for the current user
          if (Number(message.sender_id) !== Number(currentUser?.id) && 
              Number(message.receiver_id) !== Number(currentUser?.id)) {
            console.log("Message not for current user, ignoring");
            return;
          }

          setMessages(prevMessages => {
            // Get the chat ID (combination of both user IDs)
            const chatId = getChatId(message.sender_id, message.receiver_id);
            
            // Get current messages for this chat
            const currentMessages = prevMessages[chatId] || [];
            
            // Log the incoming message
            console.log("💬 Received real-time message:", {
              message,
              chatId,
              currentUserId: currentUser?.id,
              isIncoming: message.sender_id !== currentUser?.id
            });

            // Check for exact duplicate by ID or content+timestamp
            const isDuplicate = currentMessages.some(msg => {
              // Check for exact duplicate by database ID
              if (message.id && msg.id === message.id) {
                console.log("Duplicate message detected by ID:", message.id);
                return true;
              }

              // Check for duplicate by comparing content and timestamps
              const timeDiff = Math.abs(
                new Date(msg.timestamp || Date.now()).getTime() - 
                new Date(message.timestamp || Date.now()).getTime()
              );

              const contentMatch = msg.content === message.content &&
                                 Number(msg.sender_id) === Number(message.sender_id) &&
                                 Number(msg.receiver_id) === Number(message.receiver_id);

              if (contentMatch && timeDiff < 1000) { // Reduced to 1 second for stricter deduplication
                console.log("Duplicate message detected by content and timestamp");
                return true;
              }

              return false;
            });

            if (isDuplicate) {
              console.log("🔄 Preventing duplicate message:", {
                id: message.id,
                content: message.content,
                timeDiff: "< 1s"
              });
              return prevMessages;
            }

            // Format the new message
            const formattedMessage = {
              id: message.id || `${message.sender_id}-${message.receiver_id}-${Date.now()}`,
              sender_id: Number(message.sender_id),
              receiver_id: Number(message.receiver_id),
              content: String(message.content),
              timestamp: String(message.timestamp || new Date().toISOString())
            };

            // For incoming messages (not from current user), show browser notification
            if (Number(message.sender_id) !== Number(currentUser?.id)) {
              // Request notification permission if not granted
              if (Notification.permission === "default") {
                Notification.requestPermission();
              }
              
              // Show notification if permitted
              if (Notification.permission === "granted") {
                // Don't show notification if we're already viewing the chat with this user
                const isCurrentChat = selectedUser && Number(selectedUser.id) === Number(message.sender_id);
                if (!isCurrentChat) {
                  new Notification("New Message", {
                    body: message.content,
                    icon: "/favicon.ico"
                  });
                }
              }
            }

            // Update messages for this specific chat
            return {
              ...prevMessages,
              [chatId]: [...currentMessages, formattedMessage]
            };
          });
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    };
  }, [currentUser?.id]);


  // Load message history when selecting a chat
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const loadMessageHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`http://localhost:8080/api/messages?user_id=${selectedUser.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error('Failed to load message history');
          return;
        }

        const historicalMessages = await response.json();
        const chatId = getChatId(currentUser.id, selectedUser.id);
        
        setMessages(prev => ({
          ...prev,
          [chatId]: historicalMessages
        }));
      } catch (error) {
        console.error('Error loading message history:', error);
      }
    };

    loadMessageHistory();
  }, [currentUser, selectedUser]);

  // Helper function to get messages for a specific chat
  const getMessagesForChat = (otherUserId: number): MessageType[] => {
    if (!currentUser) return [];
    const chatId = getChatId(currentUser.id, otherUserId);
    return messages[chatId] || [];
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        selectedUser,
        setSelectedUser,
        onlineUsers,
        setOnlineUsers,
        messages,
        setMessages,
        socket,
        setSocket,
        getMessagesForChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// ✅ Custom hook for easy access
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
