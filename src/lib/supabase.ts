import { createClient } from "@supabase/supabase-js";

// Use placeholder credentials if variables are not yet defined to prevent Next.js static build pre-rendering failures.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project-id.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTkwNzYxNTAyMn0.placeholder-signature";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    "Supabase credentials missing. Utilizing placeholder credentials for static pre-rendering. Ensure variables are loaded in production."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
