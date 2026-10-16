import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: 5173,

    allowedHosts: ["admin.theseventhsip.online"],

    proxy: {
      "/admin": {
        target: "https://yashodeep2006-finewavetech-api.hf.space",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
