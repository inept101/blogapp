import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        await connectDB();
        // Import here to avoid model-not-compiled errors
        const User = (await import('../models/user')).default;

        return new Promise((resolve) => {
          (User as any).authenticate()(
            credentials.username,
            credentials.password,
            (err: any, user: any) => {
              if (err || !user) {
                resolve(null);
              } else {
                resolve({
                  id: user._id.toString(),
                  name: user.username,
                  email: user.email ?? '',
                });
              }
            }
          );
        });
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.username = user.name;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.username = token.username as string;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};
