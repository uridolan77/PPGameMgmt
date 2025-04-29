import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
import imagemin from 'unplugin-imagemin/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  
  return {
    plugins: [
      react(),
      // Bundle size analyzer with more detailed configuration
      visualizer({
        filename: 'stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // or 'sunburst', 'network'
      }),
      // Image optimization
      imagemin({
        // Only apply to production builds
        disable: !isProd,
        webp: {
          quality: 80,
        },
        png: {
          quality: 85,
        },
        jpeg: {
          quality: 80,
        },
      }),
      // HTML transformation for critical CSS (production only)
      createHtmlPlugin({
        minify: isProd,
        inject: {
          data: {
            injectScript: isProd 
              ? `<link rel="preload" href="/assets/index.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
                 <noscript><link rel="stylesheet" href="/assets/index.css"></noscript>`
              : '',
          },
        },
      }),
      // Enable PWA capabilities for better performance
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'PP Game Management',
          short_name: 'PPGameMgmt',
          theme_color: '#ffffff',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
          ],
        },
      }),
    ],
    css: {
      postcss: {
        plugins: [
          tailwindcssPostcss(),
          autoprefixer(),
        ],
      },
      // Extract CSS in production builds
      extract: isProd ? {
        filename: 'assets/[name].[hash].css',
        chunkFilename: 'assets/[name].[hash].css',
      } : false,
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
      // Enable source maps only for development or when explicitly requested
      sourcemap: isProd ? false : true,
      // Minification options
      minify: isProd ? 'esbuild' : false,
      cssMinify: isProd,
      rollupOptions: {
        output: {
          // Enhanced chunk splitting strategy
          manualChunks: (id) => {
            // Core React libraries
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/react-router')) {
              return 'react-core';
            }
            
            // UI libraries
            if (id.includes('node_modules/@mui')) {
              return 'ui-library';
            }
            
            // State management
            if (id.includes('node_modules/zustand') || 
                id.includes('node_modules/@tanstack/react-query')) {
              return 'state-management';
            }
            
            // Charts and visualization
            if (id.includes('node_modules/recharts') || 
                id.includes('node_modules/d3')) {
              return 'charts';
            }
            
            // Utilities
            if (id.includes('node_modules/date-fns') || 
                id.includes('node_modules/lodash') ||
                id.includes('node_modules/uuid')) {
              return 'utilities';
            }
            
            // Feature-specific chunks based on directory structure
            if (id.includes('/features/games/')) {
              return 'feature-games';
            }
            if (id.includes('/features/players/')) {
              return 'feature-players';
            }
            if (id.includes('/features/bonuses/')) {
              return 'feature-bonuses';
            }
            if (id.includes('/features/dashboard/')) {
              return 'feature-dashboard';
            }
          },
          // Hashing and asset organization
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
      },
      // Warn when individual chunks exceed 300KB (reduced from 500KB)
      chunkSizeWarningLimit: 300,
      // Report on performance metrics during build
      reportCompressedSize: true,
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