import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://lwwtfodpnqyceuqomopj.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3d3Rmb2RwbnF5Y2V1cW9tb3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzk4MDMsImV4cCI6MjA3NTc1NTgwM30.1cr-bOgfZO97ijgww3sNUPTBEjVMa3RC8pQMOnrmftI';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export default supabase;
