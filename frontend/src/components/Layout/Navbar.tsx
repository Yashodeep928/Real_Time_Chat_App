import  useLogout  from "../auth/useLogout";

const Navbar = () => {
  const logout = useLogout();

  return (
    <div className="p-4 border-b flex items-center justify-between bg-white">
      <div className="font-bold text-lg">My Chat App</div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-400" />
        <button
          onClick={logout}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
