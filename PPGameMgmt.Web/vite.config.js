import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      // Bundle size analyzer (generate stats.html)
      visualizer({
        filename: 'stats.html',
        open: false,
      }),
    ],
    css: {
      postcss: {
        plugins: [
          tailwindcssPostcss(),
          autoprefixer(),
        ],
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        // Add explicit alias for problematic packages
        'recharts': resolve(__dirname, 'node_modules/recharts'),
        'date-fns': resolve(__dirname, 'node_modules/date-fns')
      }
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: []
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      // Enable source maps for production (can be disabled for smaller bundles)
      sourcemap: mode === 'production' ? 'hidden' : true,
      rollupOptions: {
        output: {
          // Split chunks by module
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            vendors: ['zustand', '@tanstack/react-query'],
          },
        },
      },
      // Warn when individual chunks exceed 500KB
      chunkSizeWarningLimit: 500,
    },
    server: {
      port: parseInt(env.VITE_PORT || '3000'),
      hmr: {
        overlay: true, // Enable HMR overlay for better debugging
      },
      // Add proxy for API requests in development
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:7210',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx'
        }
      },
      include: ['recharts', 'date-fns'] // Explicitly include these dependencies
    },
    preview: {
      port: 8080,
    },
  }
});