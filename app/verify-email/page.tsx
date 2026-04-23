import { connectDB } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';
import Link from 'next/link';

async function verifyToken(token: string): Promise<'success' | 'expired' | 'invalid'> {
  await connectDB();
  const User = (await import('../../models/user')).default;

  const user = await (User as any).findOne({ verificationToken: token });
  if (!user) return 'invalid';

  if (user.emailVerified) return 'success';

  if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
    return 'expired';
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  await sendWelcomeEmail(user.email, user.username);

  return 'success';
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <StatusCard status="invalid" />;
  }

  const result = await verifyToken(token);
  return <StatusCard status={result} />;
}

function StatusCard({ status }: { status: 'success' | 'expired' | 'invalid' }) {
  const config = {
    success: {
      icon: '✓',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      title: 'Email verified!',
      message: 'Your account is now fully active. Start writing and sharing your ideas.',
      cta: { label: 'Go to Blogs', href: '/blogs' },
    },
    expired: {
      icon: '⏱',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      title: 'Link expired',
      message: 'This verification link has expired. Request a new one from your settings page.',
      cta: { label: 'Go to Settings', href: '/settings' },
    },
    invalid: {
      icon: '✕',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      title: 'Invalid link',
      message: 'This verification link is invalid or has already been used.',
      cta: { label: 'Go to Settings', href: '/settings' },
    },
  }[status];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-6`}>
            <span className={`text-2xl font-bold ${config.iconColor}`}>{config.icon}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">{config.title}</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">{config.message}</p>
          <Link
            href={config.cta.href}
            className="inline-block px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors"
          >
            {config.cta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
