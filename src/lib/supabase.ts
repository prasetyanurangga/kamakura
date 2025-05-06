// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!; // Gunakan SERVICE_ROLE_KEY untuk akses server-side

export const supabase = createClient(supabaseUrl, supabaseKey);
