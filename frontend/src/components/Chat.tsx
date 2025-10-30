import useLogout from "./auth/useLogout"; // also fix filename case sensitivity

function Chat() {
  const logout = useLogout(); // ✅ hook is now called

  return (
    <>
      <h2>Chat Area</h2>
      <button onClick={logout}>Logout</button>
    </>
  );
}

export default Chat;
