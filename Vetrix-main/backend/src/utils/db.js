// backend/src/utils/db.js — V2.3 DATA LAYER
// Low-friction persistence for context intelligence (Contacts + Audit Logs)
// Uses a local JSON file (aura_db.json) for zero-setup portability

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../aura_db.json');

/**
 * Initializes the local database if it doesn't exist.
 */
const initDb = () => {
  if (!fs.existsSync(DB_PATH)) {
    const initialState = { contacts: {}, transactions: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialState, null, 2));
    console.log('[DB] Initialized local storage: aura_db.json');
  }
};

const readDb = () => {
  initDb();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { contacts: {}, transactions: [] };
  }
};

const writeDb = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// ── CONTACT MANAGEMENT ─────────────────────────────────────

const addContact = (userWallet, name, address) => {
  const db = readDb();
  const wallet = userWallet.toLowerCase();
  
  if (!db.contacts[wallet]) db.contacts[wallet] = [];
  
  // Update if exists, otherwise add
  const index = db.contacts[wallet].findIndex(c => c.name.toLowerCase() === name.toLowerCase());
  if (index !== -1) {
    db.contacts[wallet][index].address = address;
  } else {
    db.contacts[wallet].push({ name, address });
  }
  
  writeDb(db);
  return true;
};

const getContact = (userWallet, name) => {
  const db = readDb();
  const wallet = userWallet.toLowerCase();
  
  if (!db.contacts[wallet]) return null;
  
  return db.contacts[wallet].find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
};

const getAllContacts = (userWallet) => {
  const db = readDb();
  return db.contacts[userWallet.toLowerCase()] || [];
};

// ── TRANSACTION AUDIT LOGS ──────────────────────────────────

const logTransaction = (tx) => {
  const db = readDb();
  const entry = {
    ...tx,
    timestamp: Date.now(),
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
  };
  
  db.transactions.unshift(entry); // Newest first
  // Max 50 transactions for performance
  if (db.transactions.length > 50) db.transactions.pop();
  
  writeDb(db);
  return entry;
};

const getLastSuccessfulTransaction = (userWallet) => {
  const db = readDb();
  const wallet = userWallet.toLowerCase();
  
  return db.transactions.find(tx => 
    tx.userWallet.toLowerCase() === wallet && 
    (tx.status === 'success' || tx.status === 'pending')
  ) || null;
};

module.exports = {
  addContact,
  getContact,
  getAllContacts,
  logTransaction,
  getLastSuccessfulTransaction
};
