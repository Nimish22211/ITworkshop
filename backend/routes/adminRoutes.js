const express = require('express');
const admin = require('../services/firebaseAdmin');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Approve a driver (sets custom claims)
router.post('/drivers/approve', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { uid, role = 'driver', approved = true } = req.body || {};
        if (!uid) return res.status(400).json({ error: 'uid is required' });

        await admin.auth().setCustomUserClaims(uid, { role, approved });
        return res.json({ success: true });
    } catch (error) {
        console.error('Approve driver error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Ensure a user exists in Firestore and set role on first login
router.post('/users/ensure', auth, async (req, res) => {
    try {
        const { role = 'driver' } = req.body || {};
        const db = req.db;

        const userRecord = await admin.auth().getUser(req.user.uid);
        const email = userRecord.email;

        const usersRef = db.collection('users');
        const existingSnapshot = await usersRef.where('email', '==', email).limit(1).get();

        let docRef;
        let created = false;
        if (existingSnapshot.empty) {
            docRef = usersRef.doc(req.user.uid);
            await docRef.set({
                uid: req.user.uid,
                email,
                name: userRecord.displayName || email,
                role,
                approved: role === 'admin' ? true : false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            created = true;

            // Set custom claims on first creation
            await admin.auth().setCustomUserClaims(req.user.uid, { role, approved: role === 'admin' });
        } else {
            const doc = existingSnapshot.docs[0];
            const data = doc.data();
            docRef = usersRef.doc(doc.id);
            const prevRole = data.role;
            let approved = data.approved === true;
            let shouldUpdateClaims = false;

            // If selected role differs from stored role, update both Firestore and claims
            if (prevRole !== role) {
                // If switching to admin, auto-approve; if switching to driver, keep previous approval
                approved = role === 'admin' ? true : approved;
                await docRef.set({ role, approved, updatedAt: new Date() }, { merge: true });
                shouldUpdateClaims = true;
            } else {
                await docRef.set({ updatedAt: new Date() }, { merge: true });
            }

            if (shouldUpdateClaims) {
                await admin.auth().setCustomUserClaims(req.user.uid, { role, approved });
            }
        }

        const snapshot = await docRef.get();
        return res.json({ success: true, created, user: { id: snapshot.id, ...snapshot.data() } });
    } catch (error) {
        console.error('Ensure user error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


