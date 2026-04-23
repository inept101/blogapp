'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useState, useEffect } from 'react';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-500 to-violet-700 bg-clip-text text-transparent"
          >
            BLOGG
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/blogs" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              All Posts
            </Link>
            {session && (
              <>
                <Link href="/my-blogs" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  My Posts
                </Link>
                <Link href="/blogs/new" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Write
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <>
                <Link href={`/users/${session.user.username}`} className="text-sm text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  Hi, <span className="text-violet-600 dark:text-violet-400 font-medium">{session.user.username}</span>
                </Link>
                <Link href="/settings" className="text-sm px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-500 hover:text-violet-600 dark:hover:text-white transition-all">
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-sm px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-500 hover:text-violet-600 dark:hover:text-white transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-500 hover:text-violet-600 dark:hover:text-white transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-4 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 flex flex-col gap-4">
          <Link href="/blogs" className="text-sm text-slate-700 dark:text-slate-300" onClick={() => setOpen(false)}>All Posts</Link>
          {session && (
            <>
              <Link href="/my-blogs" className="text-sm text-slate-700 dark:text-slate-300" onClick={() => setOpen(false)}>My Posts</Link>
              <Link href="/blogs/new" className="text-sm text-slate-700 dark:text-slate-300" onClick={() => setOpen(false)}>Write</Link>
            </>
          )}
          {session ? (
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-sm text-left text-slate-500 dark:text-slate-400">
              Logout ({session.user.username})
            </button>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" className="text-sm text-slate-700 dark:text-slate-300" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/register" className="text-sm text-violet-600 dark:text-violet-400" onClick={() => setOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
