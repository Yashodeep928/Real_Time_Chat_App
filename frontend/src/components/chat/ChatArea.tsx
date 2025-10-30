import type { ChatUser } from "../../types/chattypes";
import { useChat } from "../../context/ChatContext";
import MessageInput from "./MessageInput";
import Messages from "./Message";

interface ChatAreaProps {
  selectedUser: ChatUser | null;
}

const ChatArea = ({ selectedUser }: ChatAreaProps) => {
  const { getMessagesForChat } = useChat();

  // Get messages for the selected chat
  const chatMessages = selectedUser ? getMessagesForChat(selectedUser.id) : [];

  console.log("ChatArea rendering with messages:", chatMessages);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 font-semibold text-lg bg-gray-100">
        {selectedUser?.username || "Select a chat"}
      </div>

      {/* Messages section */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <Messages messages={chatMessages} />
      </div>

      {/* Input box */}
      <div className="p-3 border-t bg-white">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatArea;
