import React, { useEffect, useRef } from "react";
import { useChat } from "../../context/ChatContext";
import type { MessageType } from "../../types/chattypes";

interface MessagesProps {
  messages?: MessageType[];
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
  const { currentUser, selectedUser } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      const shouldAutoScroll = scrollRef.current.scrollHeight - scrollRef.current.scrollTop === scrollRef.current.clientHeight;
      
      if (shouldAutoScroll) {
        setTimeout(() => {
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [messages]);

  // 🟡 Case 1: No chat selected
  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a chat to start messaging 💬
      </div>
    );
  }

  // 🟡 Case 2: No messages yet
  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No messages yet — say hi 👋
      </div>
    );
  }

  // 🟢 Case 3: Show messages
  // Filter messages for current chat only
  console.log("Messages component - all messages:", JSON.stringify(messages, null, 2));
  console.log("Current user:", JSON.stringify(currentUser, null, 2));
  console.log("Selected user:", JSON.stringify(selectedUser, null, 2));

  if (!Array.isArray(messages)) {
    console.error("Messages is not an array:", messages);
    return null;
  }

  const relevantMessages = messages.filter(msg => {
    if (!msg || typeof msg !== 'object') {
      console.error("Invalid message object:", msg);
      return false;
    }

    if (!currentUser?.id || !selectedUser?.id) {
      console.log("Missing user IDs", { currentUser, selectedUser });
      return false;
    }

    // Convert all IDs to numbers for comparison
    const msgSenderId = Number(msg.sender_id);
    const msgReceiverId = Number(msg.receiver_id);
    const currentUserId = Number(currentUser.id);
    const selectedUserId = Number(selectedUser.id);

    // For self-messages (when user is chatting with themselves)
    if (currentUserId === selectedUserId) {
      const isSelfMessage = msgSenderId === currentUserId && msgReceiverId === currentUserId;
      console.log("Self message check:", {
        msgSenderId,
        msgReceiverId,
        currentUserId,
        isSelfMessage,
        message: msg.content
      });
      return isSelfMessage;
    }

    // For messages between two different users
    const isRelevant = (msgSenderId === currentUserId && msgReceiverId === selectedUserId) ||
                      (msgSenderId === selectedUserId && msgReceiverId === currentUserId);
    
    console.log("Message filtering:", {
      msgSenderId,
      msgReceiverId,
      currentUserId,
      selectedUserId,
      isRelevant,
      content: msg.content
    });
    return isRelevant;
  });

  console.log("Filtered messages:", relevantMessages);

  // Show no messages message if no relevant messages
  if (relevantMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No messages yet — say hi 👋
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3 overflow-y-auto h-full">
      {relevantMessages.map((msg, index) => {
        console.log("Rendering message:", {
          message: msg,
          isSender: Number(msg.sender_id) === Number(currentUser?.id),
          senderId: msg.sender_id,
          currentUserId: currentUser?.id
        });
        const isMine = Number(msg.sender_id) === Number(currentUser?.id);

        return (
          <div
            key={index}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-2xl shadow-md ${
                isMine
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              <p className="text-sm whitespace-pre-line">{msg.content}</p>

              <div className="flex items-center justify-end gap-1 mt-1">
                <p
                  className={`text-[10px] ${
                    isMine ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {isMine && (
                  <span className="text-[10px] text-gray-200">
                    ✓✓
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={scrollRef} />
    </div>
  );
};

export default Messages;
