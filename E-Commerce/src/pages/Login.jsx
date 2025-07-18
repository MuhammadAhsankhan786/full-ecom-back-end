import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { GlobalContext } from "../context/Context"; // 🧠 Context import
import Swal from "sweetalert2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { dispatch } = useContext(GlobalContext); // 🧠 Context se dispatch lena

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/login", {
        email,
        password,
      });

      // 🧠 Context me user ko set karna (Login successful hone ke baad)
      dispatch({ type: "LOGIN", payload: res.data.user });

      Swal.fire({
        title: "Congratulations",
        text: "✅ Login successful!",
        icon: "success",
      });
      setEmail("");
      setPassword("");
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert("Login failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-4 overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 transition-all duration-500 ease-in-out">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
          Login Your Account
        </h1>

        <form onSubmit={loginUser} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
