const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || '';
    const privateKey = rawKey.includes('\n') ? rawKey : rawKey.replace(/\\n/g, '\n');
    const serviceFileEnv = process.env.SERVICE_FILE;

    try {
        if (projectId && clientEmail && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({ projectId, clientEmail, privateKey })
            });
        } else if (serviceFileEnv) {
            // SERVICE_FILE contains JSON content of the service account (optionally base64-encoded)
            let serviceJsonString = serviceFileEnv;
            let serviceAccount;
            try {
                // Try direct JSON parse first
                serviceAccount = JSON.parse(serviceJsonString);
            } catch (_) {
                try {
                    // Try base64 decode then parse
                    const decoded = Buffer.from(serviceJsonString, 'base64').toString('utf-8');
                    serviceAccount = JSON.parse(decoded);
                } catch (e2) {
                    console.error('Failed to parse SERVICE_FILE as JSON or base64 JSON');
                    throw e2;
                }
            }
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin initialized using SERVICE_FILE JSON');
        } else {
            // Try to read local service account JSON if env vars are missing
            // Check for both possible file names
            const possiblePaths = [
                path.resolve(__dirname, '..', 'realtime-transport-test-firebase-adminsdk-fbsvc-bd88071b6e.json'),
                path.resolve(__dirname, '..', 'realtime-transport-test-firebase-adminsdk-fbsvc-7c69dff382.json'),
            ];

            let serviceAccountPath = null;
            for (const filePath of possiblePaths) {
                if (fs.existsSync(filePath)) {
                    serviceAccountPath = filePath;
                    break;
                }
            }

            if (serviceAccountPath) {
                const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log('✅ Firebase Admin initialized with local service account JSON:', path.basename(serviceAccountPath));
            } else {
                console.warn('⚠️ Firebase Admin service account not set. Falling back to Application Default Credentials.');
                admin.initializeApp();
            }
        }
    } catch (e) {
        console.error('Firebase Admin initialization error:', e);
        throw e;
    }
}

module.exports = admin;


