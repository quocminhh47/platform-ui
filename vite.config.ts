import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (mode === 'production') {
    const apiBaseUrl = env.VITE_API_BASE_URL?.trim()
    if (!apiBaseUrl) {
      throw new Error(
        'VITE_API_BASE_URL is required for production builds. Set it in Vercel → Environment Variables (Production/Preview) or in .env.production locally.',
      )
    }
  }

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      restoreMocks: true,
      css: true,
    },
  }
})
