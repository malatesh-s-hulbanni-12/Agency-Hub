import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true
    },
    // Make env variables available to the client
    define: {
      'import.meta.env.VITE_ADMIN_EMAIL': JSON.stringify(env.VITE_ADMIN_EMAIL),
      'import.meta.env.VITE_ADMIN_PASSWORD': JSON.stringify(env.VITE_ADMIN_PASSWORD)
    }
  }
})