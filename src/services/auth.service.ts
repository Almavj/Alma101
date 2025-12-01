import { supabase } from '@/integrations/supabase/client';

const DEFAULT_API = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/api`;
const API_URL = (import.meta.env as any).VITE_API_URL || DEFAULT_API;

export interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
}

// We intentionally avoid writing any auth data to browser storage.
// Helpers are left as no-ops so callers that previously relied on
// side-effects won't cause runtime errors.
const setLocalUser = (_user: any) => {
  // no-op: do not persist user to localStorage
};

const setLocalToken = (_token: string | null) => {
  // no-op: do not persist token to localStorage
};

export const auth = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Log full error for debugging (do not expose to users in production)
      // eslint-disable-next-line no-console
      console.error('[auth] signInWithPassword error:', error);
      throw error;
    }
    // Do not persist tokens to localStorage. Consumers should call
    // supabase.auth.getSession() when they need the current token.
    setLocalUser(data.user ?? null);
    return data;
  },

  async register(username: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth?confirmed=true`
      }
    });
    if (error) throw error;
    return data;
  },

  async requestPasswordReset(email: string) {
    // Use backend to trigger Supabase recover endpoint so we can control redirect
    const resp = await fetch(`${API_URL}/reset-password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirect_to: `${window.location.origin}/reset-password` })
    });
    const body = await resp.json();
    if (!resp.ok) throw new Error(body.error || body.message || 'Failed to request password reset');
    return body;
  },

  // Note: password reset confirmation is handled by Supabase's hosted flow.
  // If you need server-side admin resets, call the REST admin endpoint from the backend.
  async resetPassword(/* token: string, */ password: string) {
    // Update currently authenticated user's password. This requires a valid session.
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    setLocalUser(data.user ?? null);
    return data;
  },

  async logout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    // do not modify browser storage
  },
  // Return the current authenticated user. This is async because we
  // retrieve the user from the Supabase client at call time.
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await supabase.auth.getUser();
      // data.user may be undefined if no user is signed in
      const u: any = (data as any)?.user ?? null;
      if (!u) return null;
      return {
        id: u.id,
        email: u.email,
        username: (u.user_metadata && (u.user_metadata as any).username) || undefined,
        role: (u.user_metadata && (u.user_metadata as any).role) || undefined,
      } as User;
    } catch (err) {
      return null;
    }
  }
};