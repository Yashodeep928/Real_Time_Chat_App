import Navbar from "../Layout/Navbar";
import ChatList from "./Chatlist";
import type { ChatUser } from "../../types/chattypes";
import { useChat } from "../../context/ChatContext";

type SidebarProps = {
  onSelectUser?: (user: ChatUser) => void;
  onCloseSidebar?: () => void;
};

const Sidebar = ({ onSelectUser, onCloseSidebar }: SidebarProps) => {
  const { setSelectedUser } = useChat();

  return (
    <div className="flex flex-col h-screen border-r border-gray-300">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <ChatList
          onSelectUser={(user) => {
            setSelectedUser(user);
            onSelectUser?.(user);
            onCloseSidebar?.();
          }}
        />
      </div>
    </div>
  );
};

export default Sidebar;
