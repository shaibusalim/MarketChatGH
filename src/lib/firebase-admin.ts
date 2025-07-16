import admin from "firebase-admin";

if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 env variable");
}

// Decode base64
const serviceAccountJSON = Buffer.from(
  process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
  "base64"
).toString("utf-8");

// Parse JSON
const serviceAccount = JSON.parse(serviceAccountJSON);

// Initialize only if no apps
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();

export { admin, firestore };
