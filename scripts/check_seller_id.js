require("dotenv").config();
const admin = require("firebase-admin");

async function checkProductSeller() {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    const db = admin.firestore();
    const productIds = ['01i50gqHEN0dO7D2jWJa', 'Psp8D7eNHGKR6n4IeJtd'];
    for (const id of productIds) {
      const doc = await db.collection("products").doc(id).get();
      if (doc.exists) {
        console.log(`Product ${id}: sellerId = ${doc.data().sellerId}`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkProductSeller();
