import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";


const supabaseUrl =
  Constants?.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  Constants?.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;


function createSupabaseMock() {
  const builder = {
    upsert: async () => ({ data: null, error: null }),
    select: () => builder,
    eq: () => builder,
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  };
  return {
    from: () => builder,
  };
}

export const supabase =
  process.env.NODE_ENV === "test"
    ? createSupabaseMock()
    : createClient(supabaseUrl, supabaseAnonKey);
