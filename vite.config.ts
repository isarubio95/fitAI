import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { googleAvatarDevProxy } from "./vite/googleAvatarProxy.ts";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    googleAvatarDevProxy(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registramos a mano desde src/main.tsx: dentro del APK la app ya se sirve
      // del filesystem y un service worker solo añade una capa de caché capaz de
      // devolver JS viejo tras actualizar la app.
      injectRegister: null,
      includeAssets: ['favicon.ico', 'robots.txt', 'logo.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.destination === "image" && !url.hostname.endsWith("googleusercontent.com"),
            handler: "CacheFirst",
            options: {
              cacheName: "fitai-images",
              cacheableResponse: {
                statuses: [200],
              },
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Track Gym',
        short_name: 'Track Gym',
        description: 'Track Gym - Tu compañero de entrenamiento',
        theme_color: '#1a1a18',
        background_color: '#1a1a18',
        display: 'standalone',
        display_override: ['standalone', 'fullscreen'],
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: 'logo.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  // MapLibre v6 resuelve el worker con una URL relativa; el prebundle de Vite
  // la deja en 404. Lo excluimos y el componente llama a setWorkerUrl(?worker&url).
  optimizeDeps: {
    exclude: ["maplibre-gl"],
  },
}));
