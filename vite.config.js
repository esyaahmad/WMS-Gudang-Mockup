import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/WMS-Gudang-Mockup/',
  server: {
    port: 5173,
    open: true,
  },
})
