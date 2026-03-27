import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Maps known Figma asset hashes to real files in /public
const figmaAssetMap: Record<string, string> = {
  'e9ae7dd1b0fec57a241956478eec0e78bb6d67c7': '/KenNgo_Color.jpg',          // Kenneth Ngo profile photo
  '2a2c6e1ca3f5c4ba173c8c3bf0d9759ec43064b0': '/Purple Background.png',     // Login page purple background
}

// Resolves Figma Make's figma:asset/... imports to a placeholder image
// so the local dev server can run outside of Figma.
const figmaAssetPlugin = {
  name: 'figma-asset',
  resolveId(id: string) {
    if (id.startsWith('figma:asset/')) return '\0' + id
  },
  load(id: string) {
    if (id.startsWith('\0figma:asset/')) {
      const hash = id.replace('\0figma:asset/', '').replace(/\.png$/i, '')
      const mapped = figmaAssetMap[hash]
      if (mapped) return `export default "${mapped}"`
      // Fallback: 1×1 transparent PNG as a data URL
      return `export default "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="`
    }
  },
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    figmaAssetPlugin,
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
