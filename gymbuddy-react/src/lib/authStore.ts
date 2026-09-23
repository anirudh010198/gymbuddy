import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './supabaseClient'

export interface AuthState {
  session: Session | null
  user: User | null
  /** True until the first getSession() resolves — lets UI avoid flashing a
   *  "signed out" state for a split second before a persisted session loads. */
  initializing: boolean
  signInWithGoogle: () => Promise<{ ok: boolean; error?: string }>
  /** Magic link — no password, no phone OTP (that costs money on Supabase). */
  signInWithEmail: (email: string) => Promise<{ ok: boolean; error?: string }>
  signOut: () => Promise<void>
  /** Deletes the auth user via the delete_user() Postgres function (see
   *  supabase/schema.sql) — cascades to remove the profile and every
   *  workout row too. Signs out locally either way, since a deleted
   *  account can't hold a valid session. */
  deleteAccount: () => Promise<{ ok: boolean; error?: string }>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initializing: isSupabaseConfigured,

  signInWithGoogle: async () => {
    if (!supabase) return { ok: false, error: 'Accounts are not configured on this deployment.' }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app` },
    })
    return error ? { ok: false, error: error.message } : { ok: true }
  },

  signInWithEmail: async (email) => {
    if (!supabase) return { ok: false, error: 'Accounts are not configured on this deployment.' }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/app` },
    })
    return error ? { ok: false, error: error.message } : { ok: true }
  },

  signOut: async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  },

  deleteAccount: async () => {
    if (!supabase) return { ok: false, error: 'Accounts are not configured on this deployment.' }
    const { error } = await supabase.rpc('delete_user')
    await supabase.auth.signOut()
    set({ session: null, user: null })
    return error ? { ok: false, error: error.message } : { ok: true }
  },
}))

// Module-level: initialize once and keep the store in sync with Supabase's
// own auth state for the lifetime of the tab. A no-op entirely when
// Supabase isn't configured (supabase is null), matching the rest of the
// app's "gracefully do nothing without a backend" pattern.
if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.setState({ session: data.session, user: data.session?.user ?? null, initializing: false })
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ session, user: session?.user ?? null, initializing: false })
  })
}
