import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True only when both env vars are set — lets every accounts/sync feature
 *  degrade to "no backend" (same as this app with no AI key configured)
 *  instead of crashing, in local dev or any deploy that hasn't set these up. */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url!, anonKey!) : null
