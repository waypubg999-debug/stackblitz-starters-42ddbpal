import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://znndrbveowdrveimhrdq.supabase.co'
const supabaseAnonKey = 'sb_publishable_VFvJzDJr0Ote3skePwWXTQ_XuUaYbYA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)