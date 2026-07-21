import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: /Shannons-Birthday-Trip/
const base =
  process.env.GITHUB_PAGES === 'true' ? '/Shannons-Birthday-Trip/' : '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: { host: true, port: 5173 },
  preview: {
    host: true,
    port: 4173,
    // Cloudflare quick tunnels + other public previews
    allowedHosts: true,
  },
})
