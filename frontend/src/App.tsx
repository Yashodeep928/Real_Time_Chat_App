import React, { useState } from "react";
import Login from "./components/Login";
import Chat from "./components/Chat";

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <div>
      {loggedIn ? <Chat /> : <Login onLogin={() => setLoggedIn(true)} />}
    </div>
  );
};

export default App;
