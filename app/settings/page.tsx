'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { changePassword, resendVerification } from '@/lib/actions';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pwResult, setPwResult] = useState<{ error?: string; success?: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ error?: string; success?: string } | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Fetch verification status
  useEffect(() => {
    if (!session) return;
    fetch('/api/me').then(r => r.json()).then(d => setEmailVerified(d.emailVerified ?? false));
  }, [session]);

  if (status === 'loading') return null;

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwResult(null);
    setPwLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await changePassword(null, formData);
    setPwResult(res);
    setPwLoading(false);
    if (res?.success) (e.target as HTMLFormElement).reset();
  }

  async function handleResendVerification() {
    setVerifyResult(null);
    setVerifyLoading(true);
    const res = await resendVerification();
    setVerifyResult(res);
    setVerifyLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account</p>
      </div>

      {/* Email verification status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Email Verification</h2>

        {emailVerified === null ? (
          <div className="h-6 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        ) : emailVerified ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-xs font-bold">✓</span>
            <span className="text-green-700 dark:text-green-400 font-medium">Email verified</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-sm mb-4">
              <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-bold">!</span>
              <span className="text-amber-700 dark:text-amber-400 font-medium">Email not verified</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Check your inbox for a verification link, or request a new one.
            </p>
            {verifyResult?.error && (
              <div className="mb-3 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm">
                {verifyResult.error}
              </div>
            )}
            {verifyResult?.success && (
              <div className="mb-3 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 text-sm">
                {verifyResult.success}
              </div>
            )}
            <button
              onClick={handleResendVerification}
              disabled={verifyLoading}
              className="px-4 py-2 rounded-xl border border-violet-400 dark:border-violet-600 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {verifyLoading ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Change Password</h2>

        {pwResult?.error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm">
            {pwResult.error}
          </div>
        )}
        {pwResult?.success && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 text-sm">
            {pwResult.success}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current password</label>
            <input
              type="password"
              name="currentPassword"
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New password</label>
            <input
              type="password"
              name="newPassword"
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={pwLoading}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold transition-colors"
          >
            {pwLoading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
