import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uzottfvcmjjvsggpxuqg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_c41OhuCfbcHH4CJnvhK6SA_3osmIFO1'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)