import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: true, // Listen on 0.0.0.0
    allowedHosts: [
      "solid-factually-donkey.ngrok-free.app", // ✅ Your ngrok host
      // You can add more allowed domains here if needed
    ],
  },
});
