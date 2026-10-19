import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Configuración de Vite (la herramienta que arranca y empaqueta la app).
export default defineConfig({
  plugins: [
    react(),

    // PWA: permite instalar TRAZZO en el celular como una app y abrirla sin internet.
    VitePWA({
      registerType: 'autoUpdate', // cuando publiques cambios, la app se actualiza sola
      includeAssets: ['icono.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'TRAZZO',
        short_name: 'TRAZZO',
        description: 'Tus pendientes, videos y cobros en un solo vistazo.',
        lang: 'es',
        start_url: '/app',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0C0C0E',
        theme_color: '#0C0C0E',
        icons: [
          { src: '/icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icono-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Tareas', url: '/app/tareas', icons: [{ src: '/icono-192.png', sizes: '192x192' }] },
          { name: 'Tableros', url: '/app/tableros', icons: [{ src: '/icono-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Código extra del service worker: abrir la app al tocar una notificación
        importScripts: ['sw-notificaciones.js'],
      },
    }),
  ],
  build: {
    // Firebase pesa bastante; subimos el límite para que no muestre advertencias.
    chunkSizeWarningLimit: 1500,
  },
});
