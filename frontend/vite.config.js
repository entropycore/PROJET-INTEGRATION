import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// Configuration principale de Vite
export default defineConfig({
  // Utilisation du plugin Vue pour compiler les fichiers .vue
  plugins: [vue()],
  
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