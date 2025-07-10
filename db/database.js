const Database = require('better-sqlite3');
const db = new Database('listings.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    price TEXT,
    status TEXT
  )
`).run();


db.prepare(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER,
    listing_title TEXT,
    action TEXT,
    performed_by TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

module.exports = db;
