'use client';

import { Loader2, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnifiedCard } from '@/components/ui/unified/unified-card';

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Sign up failed. Please try again.');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number or symbol', met: /[0-9!@#$%^&*]/.test(formData.password) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black">
      <div className="w-full max-w-md relative">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>

        <UnifiedCard variant="elevated" padding="lg" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-900">
                <Sparkles className="h-7 w-7 text-neutral-700 dark:text-neutral-300" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-neutral-500 dark:text-neutral-400">
              Join our community and start accessing premium digital assets
            </CardDescription>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-900/50">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-neutral-700 dark:text-neutral-300">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
                required
                className="h-11 border-neutral-200 dark:border-neutral-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                required
                className="h-11 border-neutral-200 dark:border-neutral-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                required
                className="h-11 border-neutral-200 dark:border-neutral-800"
              />
              {formData.password && (
                <div className="space-y-1 mt-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${req.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`}
                      />
                      <span className={req.met ? 'text-emerald-700 dark:text-emerald-300' : 'text-neutral-500 dark:text-neutral-400'}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-neutral-700 dark:text-neutral-300">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={isLoading}
                required
                className="h-11 border-neutral-200 dark:border-neutral-800"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
              disabled={
                isLoading ||
                formData.password.length < 8 ||
                formData.password !== formData.confirmPassword
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-black px-2 text-neutral-500 dark:text-neutral-400">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link href="/auth/sign-in" className="block mt-6">
              <Button
                variant="outline"
                className="w-full h-11 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                Sign In Instead
              </Button>
            </Link>
          </div>
        </UnifiedCard>

        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
