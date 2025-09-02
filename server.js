// VacationVisits backend

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { nanoid } = require('nanoid');
const {
    saveEnquiry, saveSearch, listEnquiries, listSearches,
    countEnquiries, countSearches, deleteEnquiry, deleteSearch
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// CORS configuration
const allowedOrigins = [
    'https://vacationvisits.in',
    'https://www.vacationvisits.in',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.static(__dirname));

// ------- Health route with logging --------
app.get('/api/health', (_req, res) => {
    console.log('Health endpoint called');
    res.json({ ok: true });
});

// Main deals catalog
const deals = {
    'hyatt-special': {
        id: 'hyatt-special',
        title: 'October Hyatt Jumeirah Special',
        travelMonth: 'October 2025',
        pricing: [
            { label: 'Double sharing', price: 55500 },
            { label: 'Triple sharing', price: 51500 }
        ],
        inclusions: [
            'Dubai Return Airport transfers & Internal hotel transfer',
            'Marina Dhow Cruise with Dinner',
            'Desert Safari with BBQ Dinner',
            'Dubai Half Day City tour',
            'Aqua Venture Water Park at Atlantis ticket with transfers',
            'Burj Khalifa 124th Floor (Non-Peak Hours)',
            'Abu Dhabi City Tour With Ferrari World with Dinner',
            'Dubai VAT',
            'All Taxes Except Tourism Dirham',
            'All tours and Transfers on Private (PVT) Basis'
        ],
        optional: { label: 'Dubai Visa', price: 7000 }
    },
    'burj-khalifa': {
        id: 'burj-khalifa',
        title: 'Burj Khalifa Experience',
        travelMonth: 'All Year',
        pricing: [
            { label: 'At the Top (Non-Peak)', price: 16500 },
            { label: 'At the Top (Prime Hours)', price: 20500 }
        ],
        inclusions: [
            'Skip-the-line access to At the Top (levels 124/125)',
            'Panoramic views of Dubai skyline',
            'Multimedia presentation about the history of Dubai and Burj Khalifa',
            'Access to observation deck telescopes'
        ]
    }
};

// Admin listing (basic, unauthenticated)
app.get('/api/admin/enquiries', (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);
    res.json({ total: countEnquiries(), items: listEnquiries(limit, offset) });
});
app.get('/api/admin/searches', (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const offset = Math.max(parseInt(req.query.offset || '0', 10), 0);
    res.json({ total: countSearches(), items: listSearches(limit, offset) });
});

// Delete endpoints
app.delete('/api/admin/enquiries/:id', (req, res) => {
    const id = req.params.id;
    try { deleteEnquiry(id); res.json({ ok: true }); } catch { res.status(400).json({ error: 'Failed to delete' }); }
});
app.delete('/api/admin/searches/:id', (req, res) => {
    const id = req.params.id;
    try { deleteSearch(id); res.json({ ok: true }); } catch { res.status(400).json({ error: 'Failed to delete' }); }
});

// Convenience GET routes for delete
app.get('/api/admin/enquiries/:id/delete', (req, res) => {
    const id = req.params.id;
    try { deleteEnquiry(id); res.json({ ok: true }); } catch { res.status(400).json({ error: 'Failed to delete' }); }
});
app.get('/api/admin/searches/:id/delete', (req, res) => {
    const id = req.params.id;
    try { deleteSearch(id); res.json({ ok: true }); } catch { res.status(400).json({ error: 'Failed to delete' }); }
});

// POST fallbacks
app.post('/api/admin/enquiries/delete', (req, res) => {
    const id = req.body?.id;
    if (!id) return res.status(400).json({ error: 'id required' });
    try { deleteEnquiry(id); res.json({ ok: true }); } catch { res.status(400).json({ error: 'Failed to delete' }); }
});
app.post('/api/admin/searches/delete', (req, res) => {
    const id = req.body?.id;
    if (!id) return res.status(400).json({ error: 'id required' });
    try { deleteSearch(id); res.json({ ok: true }); } catch { res.status(400).json({ error: 'Failed to delete' }); }
});

app.get('/api/deals/:id', (req, res) => {
    const deal = deals[req.params.id];
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    res.json(deal);
});

app.post('/api/enquiries', (req, res) => {
    const { name, email, phone, destination, message } = req.body || {};
    if (!name || !email || !phone || !destination || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const record = { id: nanoid(), name, email, phone, destination, message, createdAt: new Date().toISOString() };
    saveEnquiry(record);
    res.status(201).json({ ok: true, id: record.id });
});

app.post('/api/searches', (req, res) => {
    const { query } = req.body || {};
    if (!query) return res.status(400).json({ error: 'query is required' });
    const record = { id: nanoid(), query, createdAt: new Date().toISOString() };
    saveSearch(record);
    res.status(201).json({ ok: true, id: record.id });
});

// --- Start server ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`VacationVisits backend running on http://0.0.0.0:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Production ready: listening on all interfaces`);
});
