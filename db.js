const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const dbPath = path.join(dataDir, 'app.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

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
CREATE TABLE IF NOT EXISTS searches (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  createdAt TEXT NOT NULL
);
`);

const insertEnquiry = db.prepare(`INSERT INTO enquiries (id, name, email, phone, destination, message, createdAt) VALUES (@id, @name, @email, @phone, @destination, @message, @createdAt)`);
const insertSearch = db.prepare(`INSERT INTO searches (id, query, createdAt) VALUES (@id, @query, @createdAt)`);
const selectEnquiries = db.prepare(`SELECT * FROM enquiries ORDER BY datetime(createdAt) DESC LIMIT ? OFFSET ?`);
const selectSearches = db.prepare(`SELECT * FROM searches ORDER BY datetime(createdAt) DESC LIMIT ? OFFSET ?`);
const countEnquiries = db.prepare(`SELECT COUNT(1) as c FROM enquiries`);
const countSearches = db.prepare(`SELECT COUNT(1) as c FROM searches`);
const deleteEnquiryStmt = db.prepare(`DELETE FROM enquiries WHERE id = ?`);
const deleteSearchStmt = db.prepare(`DELETE FROM searches WHERE id = ?`);

function saveEnquiry(record) {
  insertEnquiry.run(record);
}

function saveSearch(record) {
  insertSearch.run(record);
}

module.exports = {
  saveEnquiry,
  saveSearch,
  listEnquiries: (limit = 50, offset = 0) => selectEnquiries.all(limit, offset),
  listSearches: (limit = 50, offset = 0) => selectSearches.all(limit, offset),
  countEnquiries: () => countEnquiries.get().c,
  countSearches: () => countSearches.get().c,
  deleteEnquiry: (id) => deleteEnquiryStmt.run(id),
  deleteSearch: (id) => deleteSearchStmt.run(id),
};


