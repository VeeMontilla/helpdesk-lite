import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite is the tool that runs the app on your computer and builds it for Vercel.
export default defineConfig({
  plugins: [react()],
});
