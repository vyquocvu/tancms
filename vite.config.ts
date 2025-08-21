import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start-plugin'

export default defineConfig({
  plugins: [tanstackStart({ target: 'vercel', customViteReactPlugin: true }), react()],
})
