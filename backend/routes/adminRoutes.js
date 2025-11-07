const express = require('express');
const admin = require('../services/firebaseAdmin');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Approve a driver (sets custom claims and updates Firestore)
router.post('/drivers/approve', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { uid, role = 'driver', approved = true } = req.body || {};
        if (!uid) return res.status(400).json({ error: 'uid is required' });

        const db = req.db;
        const usersRef = db.collection('users');
        const userDocRef = usersRef.doc(uid);

        // Update Firestore user document
        await userDocRef.set({
            approved: approved,
            updatedAt: new Date()
        }, { merge: true });

        // Set custom claims in Firebase Auth
        await admin.auth().setCustomUserClaims(uid, { role, approved });

        // Get updated user document to return
        const updatedDoc = await userDocRef.get();
        const userData = updatedDoc.exists ? updatedDoc.data() : null;

        return res.json({
            success: true,
            message: `Driver ${approved ? 'approved' : 'disapproved'} successfully`,
            user: userData ? { id: updatedDoc.id, ...userData } : null
        });
    } catch (error) {
        console.error('Approve driver error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Ensure a user exists in Firestore and set role on first login
router.post('/users/ensure', auth, async (req, res) => {
    try {
        const { role = 'driver' } = req.body || {};
        const db = req.db;

        const userRecord = await admin.auth().getUser(req.user.uid);
        const email = userRecord.email?.toLowerCase();

        // Parse approved admin emails from ENV
        const approvedEmailsList = (process.env.APPROVED_EMAILS || '')
            .split(',')
            .map(e => e.trim().toLowerCase())
            .filter(Boolean);

        const isEmailApprovedForAdmin = approvedEmailsList.includes(email);

        // 🔒 Restrict unapproved admin access
        if (role === 'admin' && !isEmailApprovedForAdmin) {
            return res.status(403).json({
                success: false,
                error: 'You are not authorized to register or log in as admin.',
            });
        }

        // Firestore reference
        const usersRef = db.collection('users');
        const docRef = usersRef.doc(req.user.uid);
        const existingDoc = await docRef.get();

        let created = false;
        let finalRole = role;
        let finalApproved = role === 'admin' ? true : false;

        if (!existingDoc.exists) {
            // 🆕 New user — create with default or requested role
            await docRef.set({
                uid: req.user.uid,
                email,
                name: userRecord.displayName || email,
                role: finalRole,
                approved: finalApproved,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            created = true;

            await admin.auth().setCustomUserClaims(req.user.uid, {
                role: finalRole,
                approved: finalApproved,
            });
        } else {
            // 👤 Existing user — use stored approval & role values
            const data = existingDoc.data();

            finalRole = data.role || 'driver'; // trust stored role
            finalApproved = data.approved === true; // trust stored approval
            const prevClaims = { role: finalRole, approved: finalApproved };

            // Just update the "last login" timestamp
            await docRef.set({ updatedAt: new Date() }, { merge: true });

            // Keep Firebase Auth custom claims in sync (if mismatched)
            const user = await admin.auth().getUser(req.user.uid);
            const currentClaims = user.customClaims || {};
            const claimsChanged =
                currentClaims.role !== prevClaims.role ||
                currentClaims.approved !== prevClaims.approved;

            if (claimsChanged) {
                await admin.auth().setCustomUserClaims(req.user.uid, prevClaims);
            }
        }

        // ✅ Return final response
        const snapshot = await docRef.get();
        return res.json({
            success: true,
            created,
            user: { id: snapshot.id, ...snapshot.data() },
            role: finalRole,
            approved: finalApproved,
        });
    } catch (error) {
        console.error('Ensure user error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message,
        });
    }
});




module.exports = router;


