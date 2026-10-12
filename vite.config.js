import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Serves the Vercel functions in /api during `npm run dev`, so local and production match.
function vercelApi() {
  return {
    name: 'vercel-api',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res, next) => {
        const name = req.url.split('?')[0].replace(/^\/+/, '')
        if (!/^[a-z-]+$/.test(name)) return next()
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`)
          await mod.default(req, res)
        } catch (e) {
          console.error(e)
          res.statusCode = 500
          res.end('API error')
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), vercelApi()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (/node_modules\/(react|react-dom|react-router)/.test(id)) return 'vendor-react'
            if (id.includes('node_modules/framer-motion')) return 'vendor-motion'
          },
        },
      },
    },
    test: { environment: 'jsdom' },
  }
})
