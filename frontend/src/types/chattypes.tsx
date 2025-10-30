// ✅ Unified user/chat type for the whole chat app


// ✅ Message type for the chat window
export interface ChatListItem {
  id: number;
  username: string;
  lastMessage: string;
  lastTime: string;
}

// types/chattypes.ts

export interface ChatUser {
  id: number;                 // user ID from backend
  username: string;
  email?: string;
  lastMessage?: string;
  lastTime?: string;
}

export interface MessageType {
  id?: string;        // Unique message identifier
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
}

export interface ChatContextType {
  currentUser: ChatUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<ChatUser | null>>;

  selectedUser: ChatUser | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<ChatUser | null>>;

  onlineUsers: string[];
  setOnlineUsers: React.Dispatch<React.SetStateAction<string[]>>;

  messages: { [key: string]: MessageType[] };
  setMessages: React.Dispatch<React.SetStateAction<{ [key: string]: MessageType[] }>>;

  socket: WebSocket | null;
  setSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
  
  // Helper function to get messages for a specific chat
  getMessagesForChat: (otherUserId: number) => MessageType[];
}
