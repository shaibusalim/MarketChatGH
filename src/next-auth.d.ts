import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string;
      email: string;
      isAdmin: boolean;
      role: string;
      isApproved: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    isAdmin: boolean;
    role: string;
    isApproved: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    isAdmin: boolean;
    role: string;
    isApproved: boolean;
  }
}

declare module 'next/server' {
  interface NextRequest {
    auth?: import('./auth.config').Session | null;
  }
}
