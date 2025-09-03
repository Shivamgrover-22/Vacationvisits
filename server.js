const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { nanoid } = require('nanoid');

// This will now safely import the db functions without blocking
const {
    saveEnquiry, saveSearch, listEnquiries, listSearches,
    countEnquiries, countSearches, deleteEnquiry, deleteSearch
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
    'https://vacationvisits.in',
    'https://www.vacationvisits.in',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.json());
app.use(express.static(__dirname));

// API Routes
app.get('/api/health', (_req, res) => {
    console.log('Health endpoint called');
    res.json({ ok: true });
});

// Other routes remain the same...
const deals = {
    'hyatt-special': { /* ... deal data ... */ },
    'burj-khalifa': { /* ... deal data ... */ }
};
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

// Admin and delete routes...
app.get('/api/admin/enquiries', (req, res) => res.json({ total: countEnquiries(), items: listEnquiries(req.query.limit, req.query.offset) }));
app.get('/api/admin/searches', (req, res) => res.json({ total: countSearches(), items: listSearches(req.query.limit, req.query.offset) }));
app.delete('/api/admin/enquiries/:id', (req, res) => { deleteEnquiry(req.params.id); res.json({ ok: true }); });
app.delete('/api/admin/searches/:id', (req, res) => { deleteSearch(req.params.id); res.json({ ok: true }); });

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`VacationVisits backend running on http://0.0.0.0:${PORT}`);
});
