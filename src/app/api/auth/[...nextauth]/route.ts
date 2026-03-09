import { authOptions } from '@/auth.config';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { adminFirestore } from '@/lib/firebase-admin';
import bcrypt from 'bcrypt';

export const runtime = 'nodejs';

import { ratelimit } from '@/lib/ratelimit';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

async function auth(req: NextRequest, res: any) {
  if (req.method === 'POST') {
    const ip = req.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return new Response('Too many requests', { status: 429 });
    }
  }

  return NextAuth(req, res, {
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
}

export { auth as GET, auth as POST };