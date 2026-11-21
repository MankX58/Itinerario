import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, la función de api/ se monta como middleware (en Vercel corre como función serverless).
const devApi = (mode) => ({
  name: 'dev-api',
  configureServer(server) {
    Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
    server.middlewares.use(async (req, res, next) => {
      if (!req.url.startsWith('/api/')) return next();
      const { default: handler } = await server.ssrLoadModule('/api/[...path].js');
      handler(req, res);
    });
  },
});

export default defineConfig(({ mode }) => ({ plugins: [react(), devApi(mode)] }));
