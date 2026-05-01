/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials missing in browser! URL:", supabaseUrl, "Key exists:", !!supabaseAnonKey);
} else {
  console.log("Supabase initialized with URL:", supabaseUrl);
  console.log("API Key preview:", supabaseAnonKey.substring(0, 10) + "..." + supabaseAnonKey.substring(supabaseAnonKey.length - 10));
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
