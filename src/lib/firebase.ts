import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This is a server-only module

if (!admin.apps.length) {
  try {
    const serviceAccountString = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64!,
      'base64'
    ).toString('utf8');
    
    if (!serviceAccountString) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set.');
    }
    
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
  }
}

export const firestore = admin.apps.length ? admin.firestore() : undefined;
