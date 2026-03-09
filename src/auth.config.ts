import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isAdmin = user.isAdmin ?? false;
        token.role = user.role ?? (user.isAdmin ? 'admin' : 'seller');
        token.isApproved = user.isAdmin ? true : (user.isApproved ?? false);
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).role = token.role;
        (session.user as any).isApproved = token.isApproved;
      }
      return session;
    },
    async signIn({ user }) {
      if (user.isAdmin) return true;
      if (user.role === 'seller') {
        return (user as any).isApproved === true;
      }
      return false;
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
