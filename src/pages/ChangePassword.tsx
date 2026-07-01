import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Lock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from "@/components/Navigation";

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const newRef = useRef<HTMLInputElement | null>(null);

  const passwordStrength = (pw: string) => {
    return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(pw);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    if (!passwordStrength(newPassword)) {
      toast.error('Password must include uppercase, lowercase, number and a symbol');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      // First verify current password by re-authenticating
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error('Not authenticated. Please log in again.');
        navigate('/auth');
        return;
      }

      // Sign in with current password to verify it
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        toast.error('Current password is incorrect');
        setCurrentPassword('');
        return;
      }

      // Now update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      navigate('/');
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error?.message || 'Failed to change password. Please try again.');
      setNewPassword('');
      setConfirmPassword('');
      newRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-4 pt-8">
        <Card className="w-full max-w-md bg-gradient-to-br from-card to-muted border-primary/40 shadow-[0_0_40px_hsl(var(--cyber-glow)/0.3)]">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-primary drop-shadow-[0_0_20px_hsl(var(--cyber-glow))]" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Change Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-foreground">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    className="bg-input border-border text-foreground pr-10"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowCurrent(true)}
                    onMouseUp={() => setShowCurrent(false)}
                    onMouseLeave={() => setShowCurrent(false)}
                    onTouchStart={() => setShowCurrent(true)}
                    onTouchEnd={() => setShowCurrent(false)}
                    className="absolute right-2 top-9 p-1 text-muted-foreground"
                  >
                    {showCurrent ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    ref={newRef}
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="bg-input border-border text-foreground pr-10"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowNew(true)}
                    onMouseUp={() => setShowNew(false)}
                    onMouseLeave={() => setShowNew(false)}
                    onTouchStart={() => setShowNew(true)}
                    onTouchEnd={() => setShowNew(false)}
                    className="absolute right-2 top-9 p-1 text-muted-foreground"
                  >
                    {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Must include uppercase, lowercase, number and a symbol.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="bg-input border-border text-foreground pr-10"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowConfirm(true)}
                    onMouseUp={() => setShowConfirm(false)}
                    onMouseLeave={() => setShowConfirm(false)}
                    onTouchStart={() => setShowConfirm(true)}
                    onTouchEnd={() => setShowConfirm(false)}
                    className="absolute right-2 top-9 p-1 text-muted-foreground"
                  >
                    {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--cyber-glow))]"
                disabled={loading}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
