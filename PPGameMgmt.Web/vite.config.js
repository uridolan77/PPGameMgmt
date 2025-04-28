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
            overlay: false, // Disable HMR overlay temporarily while we fix the CSS issue
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
        // Add explicit alias for problematic packages
        alias: {
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