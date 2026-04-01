require("dotenv").config();
const admin = require("firebase-admin");

async function checkLeads() {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    const db = admin.firestore();
    const leadsSnapshot = await db.collection("leads").orderBy("createdAt", "desc").limit(10).get();
    console.log(`Leads found: ${leadsSnapshot.size}`);
    leadsSnapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

checkLeads();
