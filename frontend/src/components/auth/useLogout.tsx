// src/hooks/useLogout.js
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Clear localStorage or cookies
    localStorage.removeItem("token");
    // localStorage.removeItem("user");

    // Redirect to login page
    navigate("/login");

    // Optional: show toast or alert
    console.log("User logged out!");
  };

  return logout; // return the function so others can use it
};

export default useLogout;
