import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'error-catcher',
      configureServer(server) {
        server.middlewares.use('/__client_error', (req, res) => {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            console.error('\n==============================');
            console.error('🚨 CLIENT BROWSER ERROR:');
            console.error(body || req.url);
            console.error('==============================\n');
            res.end('ok');
          });
        });
      }
    }
  ],
  base: '/',
  server: {
    host: true,
    port: 5173
  }
})
