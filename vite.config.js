import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Rewrite Set-Cookie từ BE (domain Render + Secure) để trình duyệt lưu/gửi session trên http://localhost
const renderApiProxy = {
  target: 'https://be-xdudweb.onrender.com',
  changeOrigin: true,
  secure: true,
  configure(proxy) {
    proxy.on('proxyRes', (proxyRes) => {
      const raw = proxyRes.headers['set-cookie']
      if (!raw) return
      const list = Array.isArray(raw) ? raw : [raw]
      proxyRes.headers['set-cookie'] = list.map((c) =>
        c
          .replace(/;\s*Domain=[^;]*/gi, '')
          .replace(/;\s*Secure/gi, '')
          .replace(/;\s*SameSite=None/gi, '; SameSite=Lax'),
      )
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': renderApiProxy,
    },
  },
  preview: {
    proxy: {
      '/api': renderApiProxy,
    },
  },
})
