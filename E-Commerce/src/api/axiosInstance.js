// src/axiosInstance.js
// import axios from "axios";

// const axiosInstance = axios.create({
//   baseURL:
//     window.location.href.split(":")[0] == "http"
//       ? "http://localhost:5001/api/v1"
//       : "/api/v1", // 🟢 ye base URL hai
//   withCredentials: true, // 🟢 JWT Cookie bhejne k liye (Important)
// });

// export default axiosInstance;
// src/axiosInstance.js

import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    window.location.hostname === "localhost"
      ? "http://localhost:5001/api/v1"
      : "/api/v1", // 🟢 ye base URL hai,
  withCredentials: true, // 🟢 JWT Cookie bhejne k liye (Important)
});

export default axiosInstance;
