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
  },
  // 👇 Esta es la clave para el modo SPA (especialmente al hacer reload en rutas internas)
  build: {
    rollupOptions: {
      input: './index.html',
    },
  },
  // 👇 Y en producción, si usas un servidor como Nginx o Netlify
  // asegúrate de redirigir todo a index.html (esto ya lo haces en el server, no aquí)
})
