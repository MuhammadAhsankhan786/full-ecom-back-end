// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL:
//     window.location.hostname === "localhost"
//       ? "http://localhost:5001/api/v1"
//       : "https://full-ecom-back-end.vercel.app/api/v1", // ✅ sahi production baseURL
//   withCredentials: true, // ✅ JWT Cookie bhejne k liye
// });

// export default axiosInstance;

// src/api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:5001/api/v1"
      : "https://full-ecom-back-end.vercel.app/api/v1",
  withCredentials: true,
});

export default axiosInstance;
