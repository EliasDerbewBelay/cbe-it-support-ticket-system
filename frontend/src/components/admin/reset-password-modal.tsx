'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api/admin';
import { UserItem } from '@/types/admin';
import { toast } from 'sonner';
import {
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
  Sparkles,
  Copy,
  Check,
  Loader2,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { RoleBadge } from '@/components/shared/role-badge';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
  onPasswordReset: () => void;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  user,
  onPasswordReset,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const [hasCopiedSuccessSummary, setHasCopiedSuccessSummary] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedPassword, setSavedPassword] = useState('');

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setGeneratedPassword('');
      setHasCopied(false);
      setHasCopiedSuccessSummary(false);
      setIsResetting(false);
      setIsSuccess(false);
      setSavedPassword('');
    }
  }, [isOpen, user]);

  const handleGenerateStrongPassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*';
    const all = uppercase + lowercase + numbers + symbols;

    const getRandom = (chars: string) => {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return chars[arr[0] % chars.length];
    };

    const pwd = [
      getRandom(uppercase),
      getRandom(lowercase),
      getRandom(numbers),
      getRandom(symbols),
    ];

    for (let i = 4; i < 14; i++) {
      pwd.push(getRandom(all));
    }

    // Modern Fisher-Yates shuffle
    for (let i = pwd.length - 1; i > 0; i--) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      const j = arr[0] % (i + 1);
      [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
    }

    const result = pwd.join('');
    setNewPassword(result);
    setConfirmPassword(result);
    setShowPassword(true);
    setShowConfirmPassword(true);
    setGeneratedPassword(result);
    setHasCopied(false);
    toast.info('Secure temporary password generated.');
  };

  const handleCopyPassword = async (pwd: string) => {
    if (!pwd) return;
    try {
      await navigator.clipboard.writeText(pwd);
      setHasCopied(true);
      toast.success('Password copied to clipboard.');
      setTimeout(() => setHasCopied(false), 3000);
    } catch {
      toast.error('Unable to copy password to clipboard.');
    }
  };

  const handleCopyFullCredentials = async () => {
    if (!user || !savedPassword) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const uFirst = user.firstName || (user as any).first_name || '';
    const uLast = user.lastName || (user as any).last_name || '';
    const uName = `${uFirst} ${uLast}`.trim() || user.email;

    const credentialsText = [
      '==================================================',
      'CBE IT Support Ticket System - Password Reset Details',
      '==================================================',
      `User:            ${uName}`,
      `Institutional Email: ${user.email}`,
      `Staff ID:        ${user.employeeId || 'N/A'}`,
      `Department:      ${user.department?.name || 'N/A'}`,
      `New Password:    ${savedPassword}`,
      `Login URL:       ${origin}/login`,
      '==================================================',
      'Please sign in with this temporary password and update it.',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(credentialsText);
      setHasCopiedSuccessSummary(true);
      toast.success('Credentials details copied to clipboard.');
      setTimeout(() => setHasCopiedSuccessSummary(false), 3500);
    } catch {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedPassword = newPassword.trim();
    if (!trimmedPassword) {
      toast.error('Please enter or generate a new password.');
      return;
    }

    if (trimmedPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      toast.error('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsResetting(true);
    try {
      await adminApi.resetUserPassword(user.id, trimmedPassword);
      setSavedPassword(trimmedPassword);
      setIsSuccess(true);
      const uFirst = user.firstName || (user as any).first_name || '';
      const uLast = user.lastName || (user as any).last_name || '';
      const uName = `${uFirst} ${uLast}`.trim() || user.email;
      toast.success(`Password reset successfully for ${uName}.`);
      onPasswordReset();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  if (!user) return null;

  const userFirstName = user.firstName || (user as any).first_name || '';
  const userLastName = user.lastName || (user as any).last_name || '';
  const userDisplayName =
    `${userFirstName} ${userLastName}`.trim() || user.email || 'User';
  const initialF = userFirstName ? userFirstName[0]?.toUpperCase() : '';
  const initialL = userLastName ? userLastName[0]?.toUpperCase() : '';
  const initials =
    (initialF + initialL) || (user.email ? user.email[0]?.toUpperCase() : 'U');

  const passwordLengthValid = newPassword.trim().length >= 8;
  const passwordsMatch =
    newPassword.length > 0 && newPassword.trim() === confirmPassword.trim();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-100 text-[#6f1a7e] dark:bg-purple-950/60 dark:text-[#c477d2] flex items-center justify-center font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  Reset Password
                </DialogTitle>
                <RoleBadge role={user.role} />
              </div>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                for {userDisplayName} ({user.email})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* User Quick Info Bar */}
        <div className="px-5 py-2.5 bg-zinc-100/60 dark:bg-zinc-800/40 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-1.5 truncate">
            <Building className="size-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{user.department?.name || 'Department N/A'}</span>
          </div>
          {user.employeeId && (
            <div className="font-mono text-zinc-500 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
              ID: {user.employeeId}
            </div>
          )}
        </div>

        {isSuccess ? (
          /* Handover Success Screen */
          <div className="p-5 space-y-4">
            <div className="text-center space-y-2 py-2">
              <div className="mx-auto size-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="size-7" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Password Successfully Reset!
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                The account password has been updated. Securely provide these new login credentials to {userDisplayName}.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Account Username:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono text-[11px]">
                  {user.email}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-medium">New Password:</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    Immediate Effect
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-purple-200 dark:border-purple-800/80 font-mono text-xs">
                  <span className="text-zinc-900 dark:text-zinc-100 font-bold select-all tracking-wider">
                    {savedPassword}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => handleCopyPassword(savedPassword)}
                    className="shrink-0 h-6 px-2 text-[11px] text-[#6f1a7e] dark:text-[#c477d2] hover:bg-purple-100 dark:hover:bg-purple-900/40"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="size-3 mr-1 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300">
              <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                For security reasons, plaintext passwords are not stored or retrievable. Make sure you copy and send it to the employee now.
              </span>
            </div>

            <DialogFooter className="gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyFullCredentials}
                className="text-xs gap-1.5 flex-1"
              >
                {hasCopiedSuccessSummary ? (
                  <>
                    <Check className="size-3 text-emerald-600" />
                    Copied Summary
                  </>
                ) : (
                  <>
                    <Copy className="size-3 text-zinc-500" />
                    Copy Login Summary
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onClose}
                className="bg-[#6f1a7e] hover:bg-[#561361] text-white text-xs flex-1"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Password Reset Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Information Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-800/40 text-[11px] text-purple-900 dark:text-purple-300">
              <KeyRound className="size-4 shrink-0 mt-0.5 text-[#6f1a7e] dark:text-[#c477d2]" />
              <div className="space-y-0.5">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                  Lost Password Recovery
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Enter a new password or generate a cryptographically strong one for this user. The user will be notified in the system.
                </p>
              </div>
            </div>

            {/* Quick Generator */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-dashed border-purple-300 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/10">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#6f1a7e] dark:text-[#c477d2]">
                <Sparkles className="size-3.5" />
                Quick Password Tool
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleGenerateStrongPassword}
                className="h-7 text-xs bg-white dark:bg-zinc-900 border-purple-200 dark:border-purple-800 text-[#6f1a7e] dark:text-[#c477d2] hover:bg-purple-50"
              >
                Generate Strong Password
              </Button>
            </div>

            {generatedPassword && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 font-mono text-xs">
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold select-all break-all tracking-wide">
                  {generatedPassword}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => handleCopyPassword(generatedPassword)}
                  className="shrink-0 h-6 px-2 text-[11px] text-[#6f1a7e] hover:bg-purple-100 dark:hover:bg-purple-900/50"
                >
                  {hasCopied ? (
                    <>
                      <Check className="size-3 mr-1 text-emerald-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Password Inputs */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">New Password *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    className="text-xs h-8.5 pr-8 font-mono"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Confirm New Password *</Label>
                  {confirmPassword && (
                    <span className="flex items-center gap-1 text-[11px] font-medium">
                      {passwordsMatch ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <Check className="size-3" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-0.5">
                          Passwords do not match
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="text-xs h-8.5 pr-8 font-mono"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Security checklist */}
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-[11px] space-y-1.5">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Password Requirements:
              </span>
              <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <div
                  className={`size-1.5 rounded-full ${
                    passwordLengthValid ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'
                  }`}
                />
                <span>At least 8 characters in length</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <div
                  className={`size-1.5 rounded-full ${
                    passwordsMatch ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'
                  }`}
                />
                <span>New and confirm passwords match identically</span>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isResetting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isResetting || !passwordLengthValid || !passwordsMatch}
                className="bg-[#6f1a7e] hover:bg-[#561361] text-white text-xs"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset & Save Password'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
