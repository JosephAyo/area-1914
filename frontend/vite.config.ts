import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const apiBase = loadEnv(mode, ".", "VITE_").VITE_API_BASE_URL;
  if (command === "build" && apiBase?.includes("YOUR_EC2_PUBLIC_IP")) {
    throw new Error(
      "VITE_API_BASE_URL contains the YOUR_EC2_PUBLIC_IP placeholder. Set it to your API URL before building. For local review, use VITE_API_BASE_URL=http://127.0.0.1:8000/api npm run build.",
    );
  }
  return { plugins: [react()] };
});
