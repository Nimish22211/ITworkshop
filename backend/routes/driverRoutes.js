const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Driver heartbeat to share current location
router.post('/heartbeat', auth, async (req, res) => {
    try {
        const { busId, latitude, longitude, heading = null, speed = null } = req.body || {};

        if (!req.user?.uid) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!busId || typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res.status(400).json({ error: 'busId, latitude and longitude are required' });
        }

        const db = req.db;
        const now = new Date();
        const busRef = db.collection('buses').doc(busId);

        await busRef.set({
            id: busId,
            driverUid: req.user.uid,
            active: true,
            location: { lat: latitude, lng: longitude },
            heading,
            speed,
            updatedAt: now,
        }, { merge: true });

        const snapshot = await busRef.get();
        const data = snapshot.data();

        // Ensure proper serialization for Socket.IO broadcast
        const bus = {
            id: busId,
            driverUid: data.driverUid || req.user.uid,
            active: true,
            location: { lat: latitude, lng: longitude },
            heading: heading || data.heading || null,
            speed: speed || data.speed || null,
            updatedAt: now.toISOString()
        };

        // Broadcast to clients
        req.io.emit('bus-location', bus);

        return res.json({ success: true, bus });
    } catch (error) {
        console.error('Driver heartbeat error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Driver can set active/inactive
router.post('/status', auth, async (req, res) => {
    try {
        const { busId, active } = req.body || {};
        if (!busId || typeof active !== 'boolean') {
            return res.status(400).json({ error: 'busId and active are required' });
        }

        const db = req.db;
        const now = new Date();
        const busRef = db.collection('buses').doc(busId);

        // If setting to inactive, preserve existing data but mark as inactive
        // If setting to active, we need location data (should come from heartbeat)
        await busRef.set({
            id: busId,
            active,
            updatedAt: now
        }, { merge: true });

        const snapshot = await busRef.get();
        const data = snapshot.data();

        // Serialize the bus data properly
        const bus = {
            id: busId,
            active,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || now.toISOString())
        };

        // If bus has location, include it in the status update
        if (data.location) {
            bus.location = data.location;
        }

        req.io.emit('bus-status', bus);
        return res.json({ success: true, bus });
    } catch (error) {
        console.error('Driver status error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


