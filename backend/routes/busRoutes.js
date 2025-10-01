const express = require('express');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public: list active buses (for map)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const db = req.db;
        const query = await db.collection('buses').where('active', '==', true).get();
        const buses = [];
        query.forEach(doc => {
            const data = doc.data();
            buses.push({ id: doc.id, ...data, updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt });
        });
        if (buses.length === 0 && Array.isArray(req.app.locals.mockBuses)) {
            return res.json(req.app.locals.mockBuses.map(b => ({ ...b, updatedAt: new Date().toISOString() })));
        }
        return res.json(buses);
    } catch (error) {
        console.error('List buses error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Public: get a bus by id
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const db = req.db;
        const snapshot = await db.collection('buses').doc(id).get();
        if (!snapshot.exists) {
            return res.status(404).json({ error: 'Bus not found' });
        }
        const data = snapshot.data();
        return res.json({ id: snapshot.id, ...data, updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate().toISOString() : data.updatedAt });
    } catch (error) {
        console.error('Get bus error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


