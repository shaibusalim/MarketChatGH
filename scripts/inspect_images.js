
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Mock environment variables if needed or load from .env.local
// Since I can't easily load .env in this context without dotenv, I'll rely on the user having the env vars set or the script doing it.
// Actually, I should use the existing lib/firebase-admin if possible, but that's TS.
// I'll make a standalone JS script that uses the same logic but I might need the service account.
// The user has a .env file. I'll read it.

const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envConfig = require('dotenv').config({ path: envPath });

        if (envConfig.error) {
            // Try reading manually if dotenv fails or isn't installed
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
        const snapshot = await db.collection('products').limit(10).get();

        console.log('--- Product Image URLs ---');
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`Product ID: ${doc.id}`);
            console.log(`Image URL: ${data.imageUrl}`);
            console.log(`Description: ${data.description ? data.description.substring(0, 20) : 'N/A'}...`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
