import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isAdmin = user.isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id: string; email: string; isAdmin: boolean }).id = token.id;
        (session.user as { id: string; email: string; isAdmin: boolean }).email = token.email;
        (session.user as { id: string; email: string; isAdmin: boolean }).isAdmin = token.isAdmin;
      }
      return session;
    },
    async signIn({ user }) {
      console.log('[Auth] signIn callback:', user);
      return !!user?.isAdmin;
    },
  },
  pages: {
    signIn: '/admin/signin',
    error: '/admin/signin?error=true',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || (() => {
    throw new Error('NEXTAUTH_SECRET is not set. Please set it in your .env file.');
  })(),
  debug: process.env.NODE_ENV === 'development',
};
