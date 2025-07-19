import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

if (!admin.apps.length) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set or empty.');
    }

    const serviceAccountString = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64'
    ).toString('utf8');
    
    if (!serviceAccountString) {
      throw new Error('Firebase service account string is empty after base64 decoding.');
    }
    
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.projectId}.firebaseio.com`
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.message);
    throw error;
  }
}

export const adminFirestore = admin.firestore();
export const adminAuth = admin.auth();