import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl) {
  throw new Error("Missing Supabase environment variable: VITE_SUPABASE_URL.");
}
if (!supabaseAnonKey) {
  throw new Error("Missing Supabase environment variable: VITE_SUPABASE_ANON_KEY.");
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

export function edgeFunctionUrl(functionName: string) {
  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/${functionName}`;
}
