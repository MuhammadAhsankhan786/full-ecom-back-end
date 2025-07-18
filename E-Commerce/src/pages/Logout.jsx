import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { GlobalContext } from "../context/Context"; // 🧠 Context import
import Swal from "sweetalert2";

const Logout = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(GlobalContext); // 🧠 Dispatch lena

  const handleLogout = async () => {
    try {
      // ✅ Backend logout request (optional: if using session/cookies)
      await axiosInstance.get("/logout", { withCredentials: true });

      // ✅ Clear user from context + localStorage
      dispatch({ type: "LOGOUT" });

      Swal.fire({
        title: "Congratulations",
        text: "✅ Logout successful!",
        icon: "success",
      });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err?.response?.data || err.message);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4 overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 transition-all duration-500 ease-in-out">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
          Logout
        </h1>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-xl shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Logout;
