// Fix: Removed problematic triple-slash reference to 'vite/client' which was not found
// The interfaces below provide sufficient typing for the custom environment variables.

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string
    readonly VITE_AI_PROVIDER?: string
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}