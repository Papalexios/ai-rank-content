import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // ✅ Load environment variables (works for both local and Cloudflare)
    const env = loadEnv(mode, '.', '');
    
    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        
        // ✅ REQUIRED for Cloudflare Pages: set base URL for assets
        base: './',
        
        plugins: [react()],
        
        // ✅ REQUIRED: Define build settings for Pages
        build: {
            outDir: 'dist',
            sourcemap: true,
            // ✅ Prevent chunking issues in Pages environment
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom'],
                        // ✅ Keep AI SDKs separate to avoid size limits
                        ai: ['@google/genai', 'openai', '@anthropic-ai/sdk']
                    }
                }
            }
        },
        
        // ✅ CORRECT ENVIRONMENT VARIABLE HANDLING
        define: {
            // ❌ DON'T DO THIS: 'process.env.API_KEY': JSON.stringify(env.API_KEY),
            
            // ✅ DO THIS: Expose ONLY the variables your app needs, with VITE_ prefix
            'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
            'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY),
            'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(env.VITE_ANTHROPIC_API_KEY),
            'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(env.VITE_OPENROUTER_API_KEY),
            'import.meta.env.VITE_SERPER_API_KEY': JSON.stringify(env.VITE_SERPER_API_KEY),
            'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY),
            
            // ✅ For backward compatibility with any process.env references
            // (But you should refactor your code to use import.meta.env)
            'process.env.NODE_ENV': JSON.stringify(mode),
            'global': 'globalThis', // ✅ Fix for Cloudflare Workers environment
        },
        
        // ✅ REQUIRED: Optimize for Edge runtime (Cloudflare Workers/Pages)
        optimizeDeps: {
            include: ['@google/genai', 'openai', '@anthropic-ai/sdk'],
            // ✅ Exclude Node.js-only packages that won't work in browser
            exclude: ['fs', 'path', 'child_process']
        },
        
        // ✅ Fix for "Buffer is not defined" and other Node.js polyfill issues
        resolve: {
            alias: {
                // If you get polyfill errors, you might need these:
                // 'buffer': 'buffer/',
                // 'util': 'util/',
            }
        },
        
        // ✅ Development-only settings
        ...(mode === 'development' && {
            // Add dev-specific configs here if needed
        })
    };
});