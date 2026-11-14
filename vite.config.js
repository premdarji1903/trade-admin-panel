import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // leading dot = allow all ngrok subdomains (URL changes on every restart)
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app'],
  },
})
