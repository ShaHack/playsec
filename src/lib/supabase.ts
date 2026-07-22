import { createClient } from "@supabase/supabase-js";

// Use placeholder credentials if variables are not yet defined to prevent Next.js static build pre-rendering failures.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rkpocwynysurzmvjelga.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_4QDLN5897JxobwD1lie6ug_zQ21YA-u";

if (!process.env.NEXT_PROJECT_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    "Supabase credentials missing. Utilizing placeholder credentials for static pre-rendering. Ensure variables are loaded in production."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
