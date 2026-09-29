// backend/src/utils/sessionStore.js — V2.4 RECOVERY & TRUST LAYER
// Persistent session store for multi-turn intent accumulation and safety states.

const sessions = new Map();

/** Initial session state with V2.4 trust-layer flags */
const getInitialState = () => ({
  action: null,
  chain: null,
  asset: null,
  amount: null,
  to_address: null,
  swap: null,
  confidence: 0,
  risk_flags: [],
  human_readable_summary: '',
  turn_count: 0,
  created_at: Date.now(),
  needs_confirmation: false, // V2.3: Used for Safety Summary loop
  last_status: null,         // V2.3: Used for Suggest-Add recovery loop
});

const getSession = (sessionId) => {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, getInitialState());
  }
  return sessions.get(sessionId);
};

const updateSession = (sessionId, newFields) => {
  const session = getSession(sessionId);

  // Merge V2.4 Fields
  if (newFields.action && newFields.action !== 'unknown') session.action = newFields.action;
  if (newFields.chain) session.chain = newFields.chain;
  if (newFields.asset) session.asset = newFields.asset;
  if (newFields.amount) session.amount = newFields.amount;
  if (newFields.to_address) session.to_address = newFields.to_address;
  if (newFields.swap) session.swap = newFields.swap;
  if (newFields.confidence) session.confidence = newFields.confidence;
  
  // V2.4 Specific State Merge
  if (newFields.needs_confirmation !== undefined) session.needs_confirmation = newFields.needs_confirmation;
  if (newFields.last_status !== undefined) session.last_status = newFields.last_status;

  if (newFields.risk_flags && newFields.risk_flags.length > 0) {
    const existing = new Set(session.risk_flags);
    newFields.risk_flags.forEach(f => existing.add(f));
    session.risk_flags = Array.from(existing);
  }

  if (newFields.human_readable_summary) {
    session.human_readable_summary = newFields.human_readable_summary;
  }

  session.turn_count++;
  sessions.set(sessionId, session);
  return session;
};

const clearSession = (sessionId) => sessions.delete(sessionId);

module.exports = { getSession, updateSession, clearSession };
