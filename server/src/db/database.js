const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/grocery_tracker.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS grocery_lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    budget REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS grocery_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL DEFAULT 1,
    unit TEXT DEFAULT 'each',
    price REAL DEFAULT 0,
    checked INTEGER DEFAULT 0,
    kroger_product_id TEXT,
    FOREIGN KEY (list_id) REFERENCES grocery_lists(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    servings INTEGER DEFAULT 4,
    estimated_cost REAL DEFAULT 0,
    instructions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL DEFAULT 1,
    unit TEXT DEFAULT 'each',
    estimated_price REAL DEFAULT 0,
    FOREIGN KEY (recipe_id) REFERENCES user_recipes(id) ON DELETE CASCADE
  );
`);

module.exports = db;
