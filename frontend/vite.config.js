import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Build to 'dist' folder (default) for upload to public_html
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  }
})
