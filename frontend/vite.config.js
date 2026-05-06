import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// Configuration principale de Vite
export default defineConfig({
  // Utilisation du plugin Vue pour compiler les fichiers .vue
  plugins: [vue()],


  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' http://localhost:3000; form-action 'self'; frame-ancestors 'none'; base-uri 'self'",
      'Cross-Origin-Resource-Policy': 'same-origin',
    },
  },
  
  test: {
    // Activation des API globales (describe, it, expect) pour éviter les imports répétitifs
    globals: true,
    // Simulation du DOM du navigateur via jsdom (nécessaire pour les tests UI et Smoke)
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      // Configuration de l'alias '@' pour pointer vers le dossier 'src'
      // Cela facilite les imports : '@/components/...' au lieu de '../../../src/components/...'
      '@': path.resolve(__dirname, './src'),
    },
  },
})