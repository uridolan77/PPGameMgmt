import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA } from 'vite-plugin-pwa';
// Comment out the imagemin import since it has compatibility issues
// import imagemin from 'unplugin-imagemin/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    plugins: [
      react({
        // Ensure JSX is properly parsed
        include: '**/*.{jsx,tsx}',
        jsxRuntime: 'automatic',
        babel: {
          plugins: [
            // Add any babel plugins if needed
          ],
          presets: [
            ['@babel/preset-typescript', {
              isTSX: true,
              allExtensions: true,
              allowDeclareFields: true,
            }]
          ]
        }
      }),
      // Bundle size analyzer with more detailed configuration
      visualizer({
        filename: 'stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // or 'sunburst', 'network'
      }),
      // Image optimization - commented out due to Node.js version incompatibility
      /* imagemin({
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
      }), */
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
        'date-fns': resolve(__dirname, 'node_modules/date-fns'),
        // Handle MUI component resolution
        '@mui/x-react-checkbox': resolve(__dirname, './src/components/ui/checkbox.tsx')
      }
    },
    build: {
      target: 'es2020', // Updated to match optimizeDeps target
      outDir: 'dist',
      assetsDir: 'assets',
      // Enable source maps only for development or when explicitly requested
      sourcemap: isProd ? false : true,
      // Minification options
      minify: isProd ? 'esbuild' : false,
      cssMinify: isProd,
      // Add esbuild options for JSX handling
      esbuildOptions: {
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
      },
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
          target: 'https://localhost:7210',
          changeOrigin: true,
          secure: false, // Accept self-signed certificates
          // Don't rewrite the path, keep the /api prefix
          // rewrite: (path) => path.replace(/^\/api/, '')
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.ts': 'tsx',
          '.jsx': 'jsx',
          '.tsx': 'tsx'
        },
        // Add JSX factory and fragment to help esbuild parse TypeScript with JSX correctly
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        // This helps with TypeScript generics in arrow functions
        target: 'es2020'
      },
      include: ['recharts', 'date-fns'], // Explicitly include these dependencies
      exclude: ['@mui/x-react-checkbox'] // Exclude the aliased module
    },
    preview: {
      port: 8080,
    },
  }
});