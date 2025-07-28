// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   // base: "/", // ✅ Vercel ke liye correct
//   server: {
//     port: 5173,
//   },
//   plugins: [react()],
// });

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  server: {
    port: 5173,
  },
  plugins: [tailwindcss()],
});
