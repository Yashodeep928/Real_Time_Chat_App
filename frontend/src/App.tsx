import { ChatProvider } from "./context/ChatContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/Layout/Mainlayout";

function App() {
  return (
    <Router>
      <ChatProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/chat" element={<MainLayout />} />
          </Route>
        </Routes>
      </ChatProvider>
    </Router>
  );
}

export default App;
