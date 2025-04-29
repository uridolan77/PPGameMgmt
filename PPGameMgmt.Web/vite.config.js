import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcssPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 55824,
        hmr: {
            overlay: true, // Enable HMR overlay for better debugging
        }
    },
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
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx'
            }
        },
        include: ['recharts', 'date-fns'] // Explicitly include these dependencies
    }
})