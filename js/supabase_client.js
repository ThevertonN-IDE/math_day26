import CONFIG from './config.js';

// Inicializamos o cliente aqui e EXPORTAMOS ele
export const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);