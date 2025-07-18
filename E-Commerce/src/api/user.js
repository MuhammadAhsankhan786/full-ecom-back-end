// src/api/user.js
import axiosInstance from "./axiosInstance";

export const getUserDetails = async () => {
  try {
    const res = await axiosInstance.get("/me", {
      withCredentials: true,
    });
    return res.data.user;
  } catch (err) {
    console.error(
      "❌ Failed to fetch user:",
      err.response?.data || err.message
    );
    return null;
  }
};
