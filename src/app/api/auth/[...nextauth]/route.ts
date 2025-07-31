import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { adminFirestore } from '@/lib/firebase-admin';
import bcrypt from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth] Authorize called with email:', credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          throw new Error('Missing credentials');
        }

        const adminDoc = await adminFirestore
          .collection('admins')
          .where('email', '==', credentials.email)
          .limit(1)
          .get();

        if (adminDoc.empty) {
          console.log('[Auth] No admin found for email:', credentials.email);
          throw new Error('Invalid email or password');
        }

        const admin = adminDoc.docs[0].data();
        const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);
        if (!isPasswordValid) {
          console.log('[Auth] Invalid password for email:', credentials.email);
          throw new Error('Invalid email or password');
        }

        console.log('[Auth] Authentication successful for:', credentials.email);
        return {
          id: adminDoc.docs[0].id,
          email: admin.email,
          isAdmin: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.isAdmin = user.isAdmin;
        console.log('[Auth] JWT callback, isAdmin:', token.isAdmin);
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token.isAdmin) {
        session.user.isAdmin = token.isAdmin;
        console.log('[Auth] Session callback, isAdmin:', session.user.isAdmin);
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/signin',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);