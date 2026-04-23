import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { connectDB } from './db';

const providers: any[] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      username: { label: 'Username', type: 'text' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.username || !credentials?.password) return null;

      await connectDB();
      const User = (await import('../models/user')).default;

      return new Promise((resolve) => {
        (User as any).authenticate()(
          credentials.username,
          credentials.password,
          (err: any, user: any) => {
            if (err || !user) resolve(null);
            else resolve({ id: user._id.toString(), name: user.username, email: user.email ?? '' });
          }
        );
      });
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, user, profile }: any) {
      if (user) {
        // For OAuth providers, use email prefix as username if no name
        token.username = user.name ?? (user.email?.split('@')[0] || 'user');
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.username = token.username as string;
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};
