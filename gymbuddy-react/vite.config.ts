/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/engine/**/*.test.ts'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Full offline caching + real icon set land in the PWA step (CLAUDE.md prompt 5).
      manifest: {
        name: 'GymBuddy',
        short_name: 'GymBuddy',
        description: 'Know exactly what to do on the gym floor.',
        theme_color: '#1E2B30',
        background_color: '#1E2B30',
        display: 'standalone',
        start_url: '/app',
        icons: [],
      },
    }),
  ],
})
