import { authOptions } from '@/auth.config';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { adminFirestore } from '@/lib/firebase-admin';
import bcrypt from 'bcrypt';
import { ratelimit, enforceRateLimit, getClientIp } from '@/lib/ratelimit';
import { NextRequest } from 'next/server';

async function auth(req: NextRequest, res: any) {
  if (req.method === 'POST') {
    try {
      const ip = getClientIp(req);
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return new Response('Too many requests', { status: 429 });
      }

      // Per-account throttle (credential stuffing across many IPs): 10 attempts / 15 min per email.
      if (req.nextUrl.pathname.endsWith('/callback/credentials')) {
        const form = new URLSearchParams(await req.clone().text());
        const attemptedEmail = (form.get('email') || '').toLowerCase().trim();
        if (attemptedEmail) {
          const limited = await enforceRateLimit(req, 'login-account', 10, '15 m', attemptedEmail);
          if (limited) return new Response('Too many login attempts. Try again later.', { status: 429 });
        }
      }
    } catch (error) {
      console.error('[Auth] Rate limit service error (failing open):', error);
      // In case of rate limit failure (e.g. Redis DNS issue), we allow the request to proceed (fail-open)
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
                  isApproved: true,
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
                                  throw new Error('Please sign up or reset your password');
              }

              const isValid = await bcrypt.compare(credentials.password, seller.password);
              if (!isValid) {
                                throw new Error('Invalid credentials');
              }

              if (!seller.isApproved) {
                                throw new Error('Your account is pending approval');
              }

                            return {
                id: sellerDoc.id,
                email: seller.email,
                isAdmin: false,
                role: 'seller',
                isApproved: seller.isApproved,
              };
            }

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