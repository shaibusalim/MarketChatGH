import { adminFirestore } from '@/lib/firebase-admin';
import bcrypt from 'bcrypt';
import type { DefaultSession, NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// 1. First extend the base types
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    isAdmin?: boolean;
  }

  interface Session extends DefaultSession {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    isAdmin: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          const email = credentials.email.toLowerCase().trim();
          const snapshot = await adminFirestore
            .collection('admins')
            .where('email', '==', email)
            .limit(1)
            .get();

          if (snapshot.empty) {
            throw new Error('Invalid credentials');
          }

          const adminDoc = snapshot.docs[0];
          const admin = adminDoc.data();

          const isValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );
          if (!isValid) {
            throw new Error('Invalid credentials');
          }

          return {
            id: adminDoc.id,
            email: admin.email,
            isAdmin: true,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
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
  },
  pages: {
    signIn: '/admin/signin',
    error: '/admin/signin?error=true',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};