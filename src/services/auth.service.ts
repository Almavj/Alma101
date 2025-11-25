import { supabase } from '@/integrations/supabase/client';

const DEFAULT_API = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/api`;
const API_URL = (import.meta.env as any).VITE_API_URL || DEFAULT_API;

export interface User {
  id: string;
  email: string;
  username?: string;
  role?: string;
}

const setLocalUser = (user: any) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

const setLocalToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
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
    setLocalUser(data.user ?? null);
    // store access token for backend API requests
    // data.session may be undefined in some flows; guard accordingly
    const token = (data as any)?.session?.access_token ?? null;
    setLocalToken(token);
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
    localStorage.removeItem('user');
    setLocalToken(null);
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  }
};