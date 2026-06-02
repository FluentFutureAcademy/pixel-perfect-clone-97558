import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = "https://tscgmxwwugoohmtyoxjr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_4BMC3J3VzF2RCHuU7RlMGA_WcwPWcBk";

export const externalSupabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);