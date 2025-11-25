import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const DEFAULT_API = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/api`;
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API;

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const accessToken = searchParams.get('access_token') || searchParams.get('access-token');
  const refreshToken = searchParams.get('refresh_token') || searchParams.get('refresh-token');
  const SUPABASE_URL = (import.meta.env as any).VITE_SUPABASE_URL;
  const SUPABASE_KEY = (import.meta.env as any).VITE_SUPABASE_PUBLISHABLE_KEY;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLInputElement | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use backend endpoint to trigger Supabase recover so we can control redirect
      const resp = await fetch(`${API_URL}/reset-password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirect_to: `${window.location.origin}/reset-password` })
      });
      const body = await resp.json();
      if (!resp.ok) throw new Error(body.error || body.message || 'Failed to request reset');
      toast({
        title: "Success",
        description: "If an account exists with this email, you will receive password reset instructions.",
      });
    } catch (error: any) {
      console.error('Reset error:', error?.message ?? error);
      toast({
        title: "Error",
        description: error?.message ?? "Something went wrong. Please try again later.",
        variant: "destructive",
      });
      setEmail('');
      emailRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // If an access token is present in the URL, use it to call Supabase's
      // /auth/v1/user endpoint directly to update the password. This avoids
      // creating a full client session in the browser (which can cause the
      // app to treat the user as logged-in before they change their password).
      if (accessToken && SUPABASE_URL) {
        const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            // Supabase requires the anon/publishable key in the apikey header for this endpoint
            'apikey': SUPABASE_KEY ?? ''
          },
          body: JSON.stringify({ password })
        });

        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.message || 'Failed to update password');
      } else {
        // Fallback: if no access token is present, attempt to update via the client
        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      }
      toast({
        title: "Success",
        description: "Your password has been reset successfully",
      });
      navigate('/auth');
    } catch (error: any) {
      console.error('Reset error:', error?.message ?? error);
      toast({
        title: "Error",
        description: "Failed to reset password. Please use the link sent to your email or try requesting a new reset.",
        variant: "destructive",
      });
      // clear password fields and focus
      setPassword('');
      setConfirmPassword('');
      passwordRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  // If the reset link included access_token in the URL, attempt to parse/store it immediately
  useEffect(() => {
    // Supabase sometimes returns tokens in the URL after redirect. If found, set session.
    if (accessToken) {
      (async () => {
        try {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken ?? undefined });
        } catch (err) {
          console.warn('Could not set session from URL', err);
        }
      })();
    }
  }, [accessToken, refreshToken]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">
          {token ? 'Reset Your Password' : 'Request Password Reset'}
        </h1>

  {(!token && !accessToken) ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <Input
                id="email"
                  ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </form>
          ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                New Password
              </label>
                <div className="relative">
                  <Input
                    id="password"
                    ref={passwordRef}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    onTouchStart={() => setShowPassword(true)}
                    onTouchEnd={() => setShowPassword(false)}
                    aria-label="Show password"
                    className="absolute right-2 top-2 p-1 text-muted-foreground"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    ref={confirmRef}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowConfirmPassword(true)}
                    onMouseUp={() => setShowConfirmPassword(false)}
                    onMouseLeave={() => setShowConfirmPassword(false)}
                    onTouchStart={() => setShowConfirmPassword(true)}
                    onTouchEnd={() => setShowConfirmPassword(false)}
                    aria-label="Show confirm password"
                    className="absolute right-2 top-2 p-1 text-muted-foreground"
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
