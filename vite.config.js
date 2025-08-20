import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/body-progress-tracker/',
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
