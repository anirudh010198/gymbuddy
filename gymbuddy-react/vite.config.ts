/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/engine/**/*.test.ts', 'src/lib/**/*.test.ts'],
  },
  plugins: [
    react(),
    VitePWA({
      // 'prompt' (not 'autoUpdate') so a waiting update surfaces as a
      // visible "reload for the latest version" prompt (see
      // app/components/UpdatePrompt.tsx) instead of updating silently in
      // the background — the service worker itself still calls
      // skipWaiting()/clientsClaim() (workbox's generateSW default,
      // unaffected by this setting), so a stale bundle never lingers past
      // one activation either way; this only changes whether the user sees
      // it happen.
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'GymBuddy',
        short_name: 'GymBuddy',
        description: 'Know exactly what to do on the gym floor.',
        theme_color: '#0B0B0D',
        background_color: '#0B0B0D',
        display: 'standalone',
        start_url: '/app',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Default globPatterns misses fonts and icons — the core loop needs
        // everything (including the self-hosted fonts) available offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Explicit, not left to registerType's default: 'autoUpdate' turns
        // both of these on by default, but switching to 'prompt' (above)
        // silently turned clientsClaim back off — confirmed by inspecting
        // the actual built sw.js, not assumed. Both stay on regardless of
        // registerType, so a stale bundle can never linger past one
        // activation cycle even before the visitor taps the reload prompt.
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
})
