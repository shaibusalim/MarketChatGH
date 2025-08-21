import { authOptions } from '@/auth.config';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { adminFirestore } from '@/lib/firebase-admin';
import bcrypt from 'bcrypt';

export const runtime = 'nodejs';

const handler = NextAuth({
  ...authOptions,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('[Auth] Authorizing:', credentials?.email);
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
            console.log('[Auth] No admin found for email:', email);
            throw new Error('Invalid credentials');
          }

          const adminDoc = snapshot.docs[0];
          const admin = adminDoc.data();

          const isValid = await bcrypt.compare(credentials.password, admin.password);
          if (!isValid) {
            console.log('[Auth] Invalid password for email:', email);
            throw new Error('Invalid credentials');
          }

          console.log('[Auth] Authorized user:', adminDoc.id);
          return {
            id: adminDoc.id,
            email: admin.email,
            isAdmin: true,
          };
        } catch (error) {
          console.error('[Auth] Authentication error:', error);
          return null;
        }
      },
    }),
  ],
});

export { handler as GET, handler as POST };