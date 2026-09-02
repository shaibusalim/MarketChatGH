import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async redirect({ url, baseUrl }) {
      const ADMIN_PREFIX = '/mcgh-admin-control'
      // Allow absolute URLs matching this origin
      if (url.startsWith(baseUrl)) return url;
      // Allow relative URLs starting with /mcgh-admin-control or /seller
      if (url.startsWith(ADMIN_PREFIX) || url.startsWith('/seller') || url.startsWith('/seller/')) {
        return `${baseUrl}${url}`;
      }
      // Anything else → home
      return baseUrl;
    },
    async jwt({ token, user }) {
      // `user` is ONLY populated during the initial sign-in flow.
      // (on subsequent JWT refresh/re-issue calls only `token` is present.)
      if (user) {
        const u = user as any;
        const isAdminFlag = Boolean(u.isAdmin || u.role === 'admin');
        token.id = String(u.id ?? token.sub ?? '');
        token.email = String(u.email ?? token.email ?? '');
        token.isAdmin = isAdminFlag;
        token.role = isAdminFlag ? 'admin' : 'seller';
        token.isApproved = isAdminFlag ? true : Boolean(u.isApproved);
      }
      // Safety: always populate defaults even on refresh (stale tokens)
      if (typeof token.isAdmin === 'undefined') token.isAdmin = false;
      if (!token.role) token.role = token.isAdmin ? 'admin' : 'seller';
      if (typeof token.isApproved === 'undefined') token.isApproved = token.isAdmin ? true : false;
      return token;
    },
    async session({ session, token }) {
      if (!session.user) session.user = {} as any;
      const s = session.user as any;
      s.id = String(token.id ?? token.sub ?? '');
      s.email = String(token.email ?? '');
      s.isAdmin = Boolean(token.isAdmin);
      s.role = token.isAdmin ? 'admin' : 'seller';
      s.isApproved = Boolean(token.isApproved);
      return session;
    },
    async signIn({ user }) {
      const u = user as any;
      const isAdminUser = Boolean(u?.isAdmin || u?.role === 'admin');
      if (isAdminUser) return true;
      if (u?.role === 'seller') return Boolean(u?.isApproved);
      return false;
    },
  },
  pages: {
    signIn: '/mcgh-admin-control/signin',
    error: '/mcgh-admin-control/signin?error=true',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || (() => {
    throw new Error('NEXTAUTH_SECRET is not set. Please set it in your .env file.');
  })(),
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

