import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'forthcoming-jefferson-poisedly.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io',
    ],
  },
})