import { useState } from "react";

const RightChat = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Send message:", message);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages area */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="self-start bg-gray-200 text-gray-800 px-3 py-2 rounded-lg max-w-xs">
          Hello Yashodeep 👋
        </div>
        <div className="self-end bg-green-200 text-gray-800 px-3 py-2 rounded-lg max-w-xs">
          Hey! How are you?
        </div>
      </div>

      {/* Message input area */}
      <div className="p-3 flex items-center border-t border-gray-300 bg-gray-50">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-full outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={handleSend}
          className="ml-3 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default RightChat;
