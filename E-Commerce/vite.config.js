import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 5173, // ✅ Fix Vite port
  },
  plugins: [tailwindcss()], // ✅ Add Tailwind plugin
});
