import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const signupSchema = z.object({
  username: z.string().min(2, "Username is required").max(50),
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  confirmPassword: z.string().min(8)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

const passwordStrength = (pw: string) => {
  // at least one lower, one upper, one number, one symbol
  return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(pw);
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResetFlow, setIsResetFlow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('confirmed') === 'true') {
      toast.success('Email confirmed. You can now login.');
      resetForm();
    }
  }, [location.search]);

  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    // hide passwords when resetting
    setShowPassword(false);
    setShowConfirmPassword(false);
    emailRef.current?.focus();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use Supabase built-in password reset flow to send the recovery email
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        // redirect users to the reset password page so they can set a new password
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast.success('If an account exists, a password reset email was sent.');
      setIsResetFlow(false);
      setPassword('');
    } catch (error) {
      console.error('Reset error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = isLogin
      ? loginSchema.safeParse({ email, password })
      : signupSchema.safeParse({ username, email, password, confirmPassword });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    if (!passwordStrength(password)) {
      toast.error('Password must include uppercase, lowercase, number and a symbol');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success("Login successful!");
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            // After email confirmation, return to the auth page where user can login
            emailRedirectTo: `${window.location.origin}/auth?confirmed=true`
          }
        });
        
        if (error) throw error;
        
        if (data.user?.identities?.length === 0) {
          toast.error("This email is already registered. Please login instead.");
          setIsLogin(true);
          resetForm();
          return;
        }

        toast.success("Verification email sent! Please check your inbox.");
        setIsLogin(true);
        resetForm();
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      if (error instanceof Error) {
        const msg = error.message || "An error occurred";
        if (msg.includes('Email not confirmed')) {
          toast.error("Please verify your email address first.");
          // clear inputs and focus
          resetForm();
        } else if (msg.includes('Invalid login credentials')) {
          toast.error("Invalid email or password.");
          // clear inputs and focus
          resetForm();
        } else if (msg.includes('Email rate limit exceeded')) {
          toast.error("Too many attempts. Please try again later.");
        } else {
          toast.error(msg);
          // clear inputs on other auth errors (e.g., email already registered)
          resetForm();
        }
      } else {
        toast.error("An unexpected error occurred");
        resetForm();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Navigation />
      <div className="flex-1 flex items-center justify-center w-full">
        <Card className="w-full max-w-md bg-gradient-to-br from-card to-muted border-primary/40 shadow-[0_0_40px_hsl(var(--cyber-glow)/0.3)]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-primary drop-shadow-[0_0_20px_hsl(var(--cyber-glow))]" />
            </div>
              <CardTitle className="text-3xl font-bold text-foreground">
                {isResetFlow ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Join Alma101')}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isResetFlow ? 'Enter your email to receive a password reset link' : (isLogin ? 'Sign in to access exclusive content' : 'Create an account to get started')}
              </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isResetFlow ? handleResetPassword : handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>
              {isResetFlow ? null : (
                <>
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-foreground">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a username"
                        required
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                  )}

                  <div className="space-y-2 relative">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Input
                      id="password"
                      ref={passwordRef}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-input border-border text-foreground pr-10"
                    />
                    <button
                      type="button"
                      onMouseDown={() => setShowPassword(true)}
                      onMouseUp={() => setShowPassword(false)}
                      onMouseLeave={() => setShowPassword(false)}
                      onTouchStart={() => setShowPassword(true)}
                      onTouchEnd={() => setShowPassword(false)}
                      aria-label="Show password"
                      className="absolute right-2 top-9 p-1 text-muted-foreground"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    {!isLogin && (
                      <p className="text-xs text-muted-foreground mt-1">Password must be at least 8 characters and include uppercase, lowercase, a number and a symbol.</p>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="space-y-2 relative">
                        <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          ref={confirmRef}
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          required
                          className="bg-input border-border text-foreground pr-10"
                        />
                        <button
                          type="button"
                          onMouseDown={() => setShowConfirmPassword(true)}
                          onMouseUp={() => setShowConfirmPassword(false)}
                          onMouseLeave={() => setShowConfirmPassword(false)}
                          onTouchStart={() => setShowConfirmPassword(true)}
                          onTouchEnd={() => setShowConfirmPassword(false)}
                          aria-label="Show confirm password"
                          className="absolute right-2 top-9 p-1 text-muted-foreground"
                        >
                          {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                      </div>
                  )}
                </>
              )}
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--cyber-glow))]"
                disabled={loading}
              >
                {loading ? 'Processing...' : (isResetFlow ? 'Send Reset Email' : (isLogin ? 'Sign In' : 'Sign Up'))}
              </Button>
            </form>
            <div className="mt-4 text-center">
              {isResetFlow ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsResetFlow(false);
                    setPassword('');
                  }}
                  className="text-primary hover:underline"
                >
                  Back to login
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      resetForm();
                    }}
                    className="text-primary hover:underline"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                          setIsResetFlow(true);
                          resetForm();
                        }}
                      className="block mx-auto mt-2 text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;