import React, { useState } from "react";
import API from "../services/api";

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isLogin ? "/login" : "/signup";

      const payload = isLogin
        ? { email, password }
        : { username, email, password };

      const res = await API.post(endpoint, payload);

      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        onLogin();
      } else {
        alert("Registration successful! Please login now.");
        setIsLogin(true);
        setUsername("");
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      setError("Invalid credentials or server error");
    }
  };

  return (
    <div className="flex flex-col items-center mt-20">
      <h2 className="text-2xl font-bold mb-4">{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-64">
        {!isLogin && (
          <input
            className="border p-2 rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="border p-2 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white rounded p-2">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <button
        className="text-sm text-gray-600 mt-4 underline"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Create new account" : "Already have an account?"}
      </button>
    </div>
  );
};

export default Login;
