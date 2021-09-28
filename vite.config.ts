import prefresh from '@prefresh/vite';
import { UserConfig } from 'vite';

const hmr = +(process.env.HMR ?? 1);
export default {
  base: '/bg1/',
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    rollupOptions: {
      input: ['src/index.tsx', 'src/index.css'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        manualChunks: {},
      },
    },
  },
  esbuild: { jsxFactory: 'h', jsxFragment: 'Fragment' },
  server: {
    host: '0.0.0.0',
    port: 3000,
    https: {
      cert: './tls/dev.cert',
      key: './tls/dev.key',
    },
    hmr: hmr ? { host: process.env.HOST || 'localhost' } : false,
  },
  plugins: hmr ? [prefresh({})] : [],
} as UserConfig;
