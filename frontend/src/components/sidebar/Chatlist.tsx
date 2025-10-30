import { useEffect, useState } from "react";
import ContactItem from "./Contactitem";
import api from "../../services/api";
import type { ChatUser } from "../../types/chattypes";
import { useChat } from "../../context/ChatContext";

type ChatListProps = {
  onSelectUser?: (user: ChatUser) => void;
  onCloseSidebar?: () => void;
};

const ChatList = ({ onSelectUser, onCloseSidebar }: ChatListProps) => {
  const [chatList, setChatList] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { setSelectedUser } = useChat();

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const res = await api.get("/chats");

        const normalized = res.data.map((chat: any) => ({
          id: String(chat.user_id),
          username: chat.username,
          email: chat.email, // optional if backend sends it
          lastMessage: chat.last_message || "No messages yet",
          lastTime: chat.last_time || new Date().toISOString(),
        }));

        setChatList(normalized);
      } catch (error) {
        console.error("Error fetching chat list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatList();
  }, []);

  if (loading) return <div className="p-4 text-gray-500">Loading chats...</div>;
  if (chatList.length === 0)
    return <div className="p-4 text-gray-400">No chats yet.</div>;

  return (
    <div className="overflow-y-auto h-full">
      {chatList.map((chat) => (
        <div
          key={chat.id}
          onClick={() => {
            setSelectedUser(chat);
            onSelectUser?.(chat);
            onCloseSidebar?.();
          }}
        >
          <ContactItem
            name={chat.username}
            lastMessage={chat.lastMessage || ""}
            time={new Date(chat.lastTime || "").toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        </div>
      ))}
    </div>
  );
};

export default ChatList;
