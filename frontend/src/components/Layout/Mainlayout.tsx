import Sidebar from "../sidebar/Sidebar";
import ChatArea from "../chat/ChatArea";
import { useChat } from "../../context/ChatContext";

const MainLayout = () => {
  const { selectedUser } = useChat();

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-1/3 border-r border-gray-300 flex flex-col">
        <Sidebar />
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <ChatArea selectedUser={selectedUser} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-lg">
            Select a chat to start messaging 💬
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
