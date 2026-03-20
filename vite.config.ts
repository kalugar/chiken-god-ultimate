import path from 'node:path'
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, 'public/assets'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@rendering': path.resolve(__dirname, 'src/core/rendering'),
      '@ecs': path.resolve(__dirname, 'src/ecs'),
      '@game': path.resolve(__dirname, 'src/game'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@services': path.resolve(__dirname, 'src/services')
    }
  },
  build: {
    target: 'esnext'
  },
  plugins: [glsl()]
})
