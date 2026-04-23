import LoginForm from '@/components/LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const sp = await searchParams;
  const justRegistered = sp.registered === '1';

  const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const githubEnabled = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

  return (
    <LoginForm
      justRegistered={justRegistered}
      googleEnabled={googleEnabled}
      githubEnabled={githubEnabled}
    />
  );
}
