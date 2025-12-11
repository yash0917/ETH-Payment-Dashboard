import sqlite3 from "sqlite3";
import path from "path";

sqlite3.verbose();

const DB_PATH = path.join(__dirname, "..", "db.sqlite");

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Failed to open SQLite DB:", err);
  } else {
    console.log("SQLite DB opened at", DB_PATH);
  }
});

// Initialize schema
// Initialize schema
db.serialize(() => {
  // 1. Payments table
  db.run(
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      txHash TEXT,
      logIndex INTEGER,
      blockNumber INTEGER,
      fromAddr TEXT,
      toAddr TEXT,
      amount TEXT,
      timestamp INTEGER,
      createdAt INTEGER
    )`
  );

  // 2. Ensure logIndex column exists (for existing DBs)
  // SQLite doesn't support IF NOT EXISTS for ADD COLUMN comfortably in one line, 
  // but we can just ignore the error if it fails or check pragma. 
  // For simplicity in this script, we'll try to add it and ignore error if it exists.
  db.run(`ALTER TABLE payments ADD COLUMN logIndex INTEGER`, (err) => {
    // Ignore error if column already exists
  });

  // 3. Unique Index for de-duplication
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_tx_log ON payments(txHash, logIndex)`);

  // 4. Indexer State table
  db.run(
    `CREATE TABLE IF NOT EXISTS indexer_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      lastBlockNumber INTEGER,
      lastEventTimestamp INTEGER
    )`
  );

  // Ensure the single row exists
  db.run(`INSERT OR IGNORE INTO indexer_state (id, lastBlockNumber, lastEventTimestamp) VALUES (1, 0, 0)`);
});
