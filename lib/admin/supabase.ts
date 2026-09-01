import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// We use the anon key for storage uploads, as long as bucket policies allow it,
// or you can configure a service_role key if required in production.
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
