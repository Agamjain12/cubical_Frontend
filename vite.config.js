import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from 'dotenv';

// Load env file
dotenv.config();

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  // resolve: {
  //   alias: {
  //     process: "process/browser",
  //     stream: "stream-browserify",
  //     zlib: "browserify-zlib",
  //     util: "util",
  //   },
  // },
  // optimizeDeps: {
  //   include: ["process/browser", "stream-browserify", "util"],
  // },
});
