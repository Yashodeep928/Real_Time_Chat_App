type Props = {
  name: string;
  lastMessage: string;
  unread?: boolean;
  time: string;
};

const ContactItem = ({ name, lastMessage, unread, time }: Props) => {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer">
      {/* Profile Circle */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-400" />
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">{lastMessage}</div>
        </div>
      </div>

      {/* Time & Unread */}
      <div className="flex flex-col items-end">
        <div className="text-xs text-gray-400">{time}</div>
        {unread && <div className="text-sm font-bold text-blue-500">●</div>}
      </div>
    </div>
  );
};

export default ContactItem;
