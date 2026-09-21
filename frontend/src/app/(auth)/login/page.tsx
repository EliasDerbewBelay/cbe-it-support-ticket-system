'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, Wrench, User, Loader2, AlertCircle, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your institutional email and password.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setIsWakingUp(false);

    // If server takes longer than 2.5s (e.g. Render free tier waking up), notify the user
    const wakeTimer = setTimeout(() => {
      setIsWakingUp(true);
    }, 2500);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      clearTimeout(wakeTimer);
      setIsLoading(false);
      setIsWakingUp(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError(null);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="relative flex items-center justify-center size-20 shrink-0 mb-1">
          <Image
            src="/cbe_logo.png"
            alt="Commercial Bank of Ethiopia Logo"
            width={80}
            height={80}
            className="size-full object-contain drop-shadow-sm"
            priority
          />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Commercial Bank of Ethiopia
        </h1>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Information Systems Department &bull; IT Service Desk
        </p>
      </div>

      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg font-semibold tracking-tight">Staff Sign In</CardTitle>
          <CardDescription className="text-xs">
            Authenticate using your active institutional CBE network account.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@cbe.com.et"
                  className="pl-9 text-sm h-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-zinc-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 text-sm h-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              className="w-full h-9 bg-[#6f1a7e] hover:bg-[#561361] text-white font-medium text-sm transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {isWakingUp ? 'Waking up backend server...' : 'Verifying Credentials...'}
                </>
              ) : (
                'Sign In'
              )}
            </Button>
            {isWakingUp && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center animate-pulse">
                Connecting to cloud server... Cloud instances may take up to 45s on cold start.
              </p>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* Demo Quick Fill Switcher for Defence & Evaluation */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Quick Demo Accounts
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">Password@123</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin.is@cbe.com.et', 'Password@123')}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/50 text-left transition-colors group"
          >
            <Shield className="size-4 text-amber-600 dark:text-amber-400 mb-1" />
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Admin</span>
            <span className="text-[10px] text-zinc-400 truncate max-w-full">admin.is</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('tech.support@cbe.com.et', 'Password@123')}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/50 text-left transition-colors group"
          >
            <Wrench className="size-4 text-purple-600 dark:text-purple-400 mb-1" />
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Technician</span>
            <span className="text-[10px] text-zinc-400 truncate max-w-full">tech.support</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('chaltu.finance@cbe.com.et', 'Password@123')}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 text-left transition-colors group"
          >
            <User className="size-4 text-blue-600 dark:text-blue-400 mb-1" />
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Employee</span>
            <span className="text-[10px] text-zinc-400 truncate max-w-full">chaltu.fin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
