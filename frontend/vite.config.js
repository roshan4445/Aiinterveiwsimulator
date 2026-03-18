import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy API calls to Flask backend during development
// so we don't need CORS configuration in development
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
