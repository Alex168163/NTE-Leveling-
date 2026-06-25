import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built app works both on the web and when loaded
// from the local filesystem inside the Electron (.exe) window.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
})
