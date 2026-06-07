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
}

function createOrUpdateDNI(userId, { nombre, fecha_nacimiento, sexo, nacionalidad }) {
  const database = getDB();
  const stmt = database.prepare(`
    INSERT INTO dnis (user_id, nombre, fecha_nacimiento, sexo, nacionalidad, creado_en)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      nombre = excluded.nombre,
      fecha_nacimiento = excluded.fecha_nacimiento,
      sexo = excluded.sexo,
      nacionalidad = excluded.nacionalidad,
      creado_en = excluded.creado_en
  `);
  stmt.run(userId, nombre, fecha_nacimiento, sexo, nacionalidad, new Date().toISOString());
}

function getDNI(userId) {
  const database = getDB();
  const stmt = database.prepare('SELECT * FROM dnis WHERE user_id = ?');
  return stmt.get(userId);
}

function getAllDNIs() {
  const database = getDB();
  const stmt = database.prepare('SELECT * FROM dnis');
  return stmt.all();
}

function deleteDNI(userId) {
  const database = getDB();
  const stmt = database.prepare('DELETE FROM dnis WHERE user_id = ?');
  stmt.run(userId);
}

function searchDNIsByName(term) {
  const database = getDB();
  const stmt = database.prepare('SELECT * FROM dnis WHERE LOWER(nombre) LIKE ?');
  return stmt.all(`%${term.toLowerCase()}%`);
}

module.exports = {
  getDB,
  createOrUpdateDNI,
  getDNI,
  getAllDNIs,
  deleteDNI,
  searchDNIsByName
};