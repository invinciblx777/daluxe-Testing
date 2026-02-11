
// Initialize the Supabase client
const { createClient } = supabase;

const _supabaseUrl = window.CONFIG.SUPABASE_URL;
const _supabaseAnonKey = window.CONFIG.SUPABASE_ANON_KEY;

const supabaseClient = createClient(_supabaseUrl, _supabaseAnonKey);

// Export for use in other files if using modules, otherwise it's global
if (typeof window !== 'undefined') {
    window.supabase = supabaseClient;
}

console.log('✅ Supabase Client Initialized');
