
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envConfig = require('dotenv').config({ path: envPath });

        if (envConfig.error) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) process.env[key.trim()] = value.trim();
            });
        }

        if (!getApps().length) {
            if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
                console.error('FIREBASE_SERVICE_ACCOUNT_BASE64 is missing');
                return;
            }
            const serviceAccount = JSON.parse(
                Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8')
            );

            initializeApp({
                credential: cert(serviceAccount)
            });
        }

        const db = getFirestore();
        // Query for products where imageUrl starts with https://
        // Firestore doesn't support 'startsWith' natively in the same way, but we can range query
        const snapshot = await db.collection('products')
            .where('imageUrl', '>=', 'https://')
            .where('imageUrl', '<=', 'https://\uf8ff')
            .limit(5)
            .get();

        console.log('--- Firebase Storage Product Images ---');
        if (snapshot.empty) {
            console.log('No products found with https:// URLs.');
        } else {
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`Product ID: ${doc.id}`);
                console.log(`Image URL: ${data.imageUrl}`);
                console.log(`Description: ${data.description ? data.description.substring(0, 20) : 'N/A'}...`);
                console.log('---');
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
