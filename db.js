const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'vacationvisits.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    destination TEXT NOT NULL,
    message TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS searches (
    id TEXT PRIMARY KEY,
    query TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

// Prepare statements for reuse
const insertEnquiry = db.prepare('INSERT INTO enquiries (id, name, email, phone, destination, message, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
const insertSearch = db.prepare('INSERT INTO searches (id, query, createdAt) VALUES (?, ?, ?)');
const listAllEnquiries = db.prepare('SELECT * FROM enquiries ORDER BY createdAt DESC LIMIT ? OFFSET ?');
const listAllSearches = db.prepare('SELECT * FROM searches ORDER BY createdAt DESC LIMIT ? OFFSET ?');
const countAllEnquiries = db.prepare('SELECT COUNT(*) AS count FROM enquiries');
const countAllSearches = db.prepare('SELECT COUNT(*) AS count FROM searches');
const deleteEnquiryById = db.prepare('DELETE FROM enquiries WHERE id = ?');
const deleteSearchById = db.prepare('DELETE FROM searches WHERE id = ?');

function saveEnquiry(record) {
    insertEnquiry.run(record.id, record.name, record.email, record.phone, record.destination, record.message, record.createdAt);
}

function saveSearch(record) {
    insertSearch.run(record.id, record.query, record.createdAt);
}

function listEnquiries(limit = 50, offset = 0) {
    return listAllEnquiries.all(limit, offset);
}

function listSearches(limit = 50, offset = 0) {
    return listAllSearches.all(limit, offset);
}

function countEnquiries() {
    return countAllEnquiries.get().count;
}

function countSearches() {
    return countAllSearches.get().count;
}

function deleteEnquiry(id) {
    deleteEnquiryById.run(id);
}

function deleteSearch(id) {
    deleteSearchById.run(id);
}

module.exports = {
    saveEnquiry,
    saveSearch,
    listEnquiries,
    listSearches,
    countEnquiries,
    countSearches,
    deleteEnquiry,
    deleteSearch,
};
