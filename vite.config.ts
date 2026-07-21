import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site needs the repo subpath; Capacitor/local use './'.
const base = process.env.VITE_BASE_PATH || './'

export default defineConfig({
  plugins: [react()],
  base,
  server: { host: true, port: 5173 },
})
