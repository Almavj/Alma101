import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const authSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [username] = useState("");
  const location = useLocation();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
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
            emailRedirectTo: `${window.location.origin}/auth`
          }
        });
        
        if (error) throw error;
        
        if (data.user?.identities?.length === 0) {
          toast.error("This email is already registered. Please login instead.");
          setIsLogin(true);
          return;
        }
        
        toast.success("Verification email sent! Please check your inbox.");
        setIsLogin(true);
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      if (error instanceof Error) {
        const msg = error.message || "An error occurred";
        if (msg.includes('Email not confirmed')) {
          toast.error("Please verify your email address first.");
        } else if (msg.includes('Invalid login credentials')) {
          toast.error("Invalid email or password.");
        } else if (msg.includes('Email rate limit exceeded')) {
          toast.error("Too many attempts. Please try again later.");
        } else {
          toast.error(msg);
        }
      } else {
        toast.error("An unexpected error occurred");
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
            {isLogin ? "Welcome Back" : "Join Alma101"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin ? "Sign in to access exclusive content" : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-input border-border text-foreground"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--cyber-glow))]"
              disabled={loading}
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;