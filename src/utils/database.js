const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dbDir, 'database.sqlite');

let db = null;

function getDB() {
  if (!db) {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new Database(dbPath);
    initTables();
  }
  return db;
}

function initTables() {
  const database = getDB();

  database.exec(`
    CREATE TABLE IF NOT EXISTS dnis (
      user_id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      fecha_nacimiento TEXT NOT NULL,
      sexo TEXT NOT NULL,
      nacionalidad TEXT NOT NULL,
      creado_en TEXT NOT NULL
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS economy (
      user_id TEXT PRIMARY KEY,
      cash INTEGER DEFAULT 0,
      bank INTEGER DEFAULT 0,
      last_collect INTEGER DEFAULT 0
    )
  `);
}

// ==================== ECONOMÍA ====================

function getOrCreateUser(userId) {
  const database = getDB();
  let user = database.prepare('SELECT * FROM economy WHERE user_id = ?').get(userId);
  if (!user) {
    database.prepare('INSERT INTO economy (user_id, cash, bank) VALUES (?, 0, 0)').run(userId);
    user = { user_id: userId, cash: 0, bank: 0, last_collect: 0 };
  }
  return user;
}

function getBalance(userId) {
  return getOrCreateUser(userId);
}

function updateBalance(userId, cash, bank) {
  const database = getDB();
  database.prepare(`UPDATE economy SET cash = ?, bank = ? WHERE user_id = ?`).run(cash, bank, userId);
}

function addCash(userId, amount) {
  const user = getOrCreateUser(userId);
  updateBalance(userId, user.cash + amount, user.bank);
}

function deposit(userId, amount) {
  const user = getOrCreateUser(userId);
  if (user.cash < amount) return false;
  updateBalance(userId, user.cash - amount, user.bank + amount);
  return true;
}

function withdraw(userId, amount) {
  const user = getOrCreateUser(userId);
  if (user.bank < amount) return false;
  updateBalance(userId, user.cash + amount, user.bank - amount);
  return true;
}

function canCollect(userId) {
  const user = getOrCreateUser(userId);
  const now = Date.now();
  const fourHours = 4 * 60 * 60 * 1000;
  return (now - user.last_collect) >= fourHours;
}

function updateLastCollect(userId) {
  const database = getDB();
  database.prepare('UPDATE economy SET last_collect = ? WHERE user_id = ?').run(Date.now(), userId);
}

// Nueva función para Leaderboard
function getTopUsers(limit = 10) {
  const database = getDB();
  return database.prepare(`
    SELECT user_id, cash, bank, (cash + bank) as total 
    FROM economy 
    ORDER BY total DESC 
    LIMIT ?
  `).all(limit);
}

module.exports = {
  getDB,
  getBalance,
  addCash,
  deposit,
  withdraw,
  canCollect,
  updateLastCollect,
  getTopUsers
};