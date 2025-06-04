import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
    allowedHosts: [
      'front-production-0596.up.railway.app'
    ],
    // 🔧 Esta es la línea que importa para rutas tipo /project/123
    historyApiFallback: true 
  }
})
