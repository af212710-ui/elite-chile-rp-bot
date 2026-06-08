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
      last_collect INTEGER DEFAULT 0,
      last_salary_reminder INTEGER DEFAULT 0
    )
  `);
}

function getOrCreateUser(userId) {
  const database = getDB();
  let user = database.prepare('SELECT * FROM economy WHERE user_id = ?').get(userId);
  if (!user) {
    database.prepare('INSERT INTO economy (user_id, cash, bank, last_collect, last_salary_reminder) VALUES (?, 0, 0, 0, 0)').run(userId);
    user = { user_id: userId, cash: 0, bank: 0, last_collect: 0, last_salary_reminder: 0 };
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

function canCollect(userId) {
  const user = getOrCreateUser(userId);
  const now = Date.now();
  const weekInMs = 7 * 24 * 60 * 60 * 1000;
  return (now - user.last_collect) >= weekInMs;
}

function updateLastCollect(userId) {
  const database = getDB();
  database.prepare('UPDATE economy SET last_collect = ? WHERE user_id = ?').run(Date.now(), userId);
}

function getLastCollect(userId) {
  const user = getOrCreateUser(userId);
  return user.last_collect;
}

function updateLastSalaryReminder(userId) {
  const database = getDB();
  database.prepare('UPDATE economy SET last_salary_reminder = ? WHERE user_id = ?').run(Date.now(), userId);
}

function getLastSalaryReminder(userId) {
  const user = getOrCreateUser(userId);
  return user.last_salary_reminder;
}

module.exports = {
  getDB,
  getBalance,
  addCash,
  canCollect,
  updateLastCollect,
  getLastCollect,
  updateLastSalaryReminder,
  getLastSalaryReminder
};