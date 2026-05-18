import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    proxy: {
      '/api/v1/auth':       { target: 'http://localhost:3005', changeOrigin: true },
      '/api/users':         { target: 'http://localhost:3001', changeOrigin: true, rewrite: path => path.replace(/^\/api\/users/, '/api/v1/users') },
      '/api/products':      { target: 'http://localhost:3002', changeOrigin: true, rewrite: path => path.replace(/^\/api\/products/, '/api/v1/inventory') },
      '/api/orders':        { target: 'http://localhost:3003', changeOrigin: true, rewrite: path => path.replace(/^\/api\/orders/, '/api/v1/orders') },
      '/api/notifications': { target: 'http://localhost:3004', changeOrigin: true, rewrite: path => path.replace(/^\/api\/notifications/, '/api/v1/noti') },
    }
  }
})