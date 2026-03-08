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
          
          // Try to find in admins collection first
          const adminSnapshot = await adminFirestore
            .collection('admins')
            .where('email', '==', email)
            .limit(1)
            .get();

          if (!adminSnapshot.empty) {
            const adminDoc = adminSnapshot.docs[0];
            const admin = adminDoc.data();
            const isValid = await bcrypt.compare(credentials.password, admin.password);
            if (isValid) {
              return {
                id: adminDoc.id,
                email: admin.email,
                isAdmin: true,
                role: 'admin',
              };
            }
          }

          // If not admin, try to find in sellers collection
          const sellerSnapshot = await adminFirestore
            .collection('sellers')
            .where('email', '==', email)
            .limit(1)
            .get();

          if (!sellerSnapshot.empty) {
            const sellerDoc = sellerSnapshot.docs[0];
            const seller = sellerDoc.data();
            
            // Check if seller has a password (they might have been onboarded by admin without a password)
            if (!seller.password) {
               console.log('[Auth] Seller has no password:', email);
               throw new Error('Please sign up or reset your password');
            }

            const isValid = await bcrypt.compare(credentials.password, seller.password);
            if (!isValid) {
              console.log('[Auth] Invalid password for seller:', email);
              throw new Error('Invalid credentials');
            }

            if (!seller.isApproved) {
              console.log('[Auth] Seller not approved:', email);
              throw new Error('Your account is pending approval');
            }

            console.log('[Auth] Authorized seller:', sellerDoc.id);
            return {
              id: sellerDoc.id,
              email: seller.email,
              isAdmin: false,
              role: 'seller',
              isApproved: seller.isApproved,
            };
          }

          console.log('[Auth] No user found for email:', email);
          throw new Error('Invalid credentials');
        } catch (error) {
          console.error('[Auth] Authentication error:', error);
          return null;
        }
      },
    }),
  ],
});

export { handler as GET, handler as POST };