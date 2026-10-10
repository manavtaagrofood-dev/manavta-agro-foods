import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: 'frontend',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      
input: {
  main: resolve(process.cwd(), 'frontend/index.html'),
  admin: resolve(process.cwd(), 'frontend/admin.html'),
  account: resolve(process.cwd(), 'frontend/account.html'),
  privacy: resolve(process.cwd(), 'frontend/privacy-policy.html'),
  terms: resolve(process.cwd(), 'frontend/terms-and-conditions.html'),
  shipping: resolve(process.cwd(), 'frontend/shipping-policy.html'),
  cookies: resolve(process.cwd(), 'frontend/cookie-policy.html'),
},

    },
  },
});
