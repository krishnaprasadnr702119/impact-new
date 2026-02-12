import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000, // Match the port in docker-compose and Dockerfile
    strictPort: true,
    cors: true,
    hmr: {
      // Completely disable HMR to prevent WebSocket connection issues
      disable: true
    },
    watch: {
      usePolling: false, // Disable polling to reduce CPU usage
    },
    allowedHosts: ['vm-ops-sec-06.inapp.com', 'localhost', '.local', '.inapp.com'],
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        headers: {
          'Connection': 'keep-alive'
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            console.log('Headers:', proxyReq.getHeaders());
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/uploads': {
        target: process.env.VITE_API_URL || 'http://backend:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: ['vm-ops-sec-06.inapp.com', 'localhost', '.local', '.inapp.com']
  },
});

