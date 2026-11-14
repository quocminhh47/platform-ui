import { validateApiBaseUrl } from './scripts/validate-api-base-url.ts'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (mode === 'production') {
    validateApiBaseUrl(env.VITE_API_BASE_URL)
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
