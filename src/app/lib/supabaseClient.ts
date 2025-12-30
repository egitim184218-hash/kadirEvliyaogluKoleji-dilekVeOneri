import { createClient } from '@supabase/supabase-js'

// Vercel'e girdiğimiz anahtarları buradan okuyacak
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)