require("dotenv").config();
const admin = require("firebase-admin");
const { readFileSync } = require("fs");

async function checkData() {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountBase64) {
      console.error("FIREBASE_SERVICE_ACCOUNT_BASE64 not set");
      return;
    }
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    const db = admin.firestore();
    
    console.log("--- Checking Leads ---");
    const leadsSnapshot = await db.collection("leads").limit(5).get();
    console.log(`Total leads in sample: ${leadsSnapshot.size}`);
    leadsSnapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });

    console.log("\n--- Checking Products with Views > 0 ---");
    const productsSnapshot = await db.collection("products").where("views", ">", 0).limit(5).get();
    console.log(`Products with views: ${productsSnapshot.size}`);
    productsSnapshot.forEach(doc => {
      console.log(doc.id, { description: doc.data().description, views: doc.data().views });
    });

  } catch (err) {
    console.error("Error:", err);
  }
}

checkData();
