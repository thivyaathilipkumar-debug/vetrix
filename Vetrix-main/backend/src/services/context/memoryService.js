// backend/src/services/context/memoryService.js — V2.2 MEMORY LAYER
// Resolves repetitive intent requests like "Repeat last transaction"
// Uses the persistent audit log (getLastSuccessfulTransaction)

const { getLastSuccessfulTransaction } = require('../../utils/db');

/**
 * Resolves a 'repeat' intent by pulling the last successful transaction from the audit log.
 * Updates the current session with the historical recipient, asset, and amount.
 * 
 * @param {string} userWallet - The address of the current user.
 * @param {Object} currentSession - The current active session to pre-fill.
 * @returns {Object} { status, message, updatedSession }
 */
const resolveTransactionMemory = (userWallet, currentSession) => {
  const lastTx = getLastSuccessfulTransaction(userWallet);

  if (!lastTx) {
    return {
      status: 'no_history',
      message: "I couldn't find any recent successful transactions in your history to repeat. What would you like to do instead?",
      updatedSession: currentSession
    };
  }

  // Pre-fill the session with historical data
  const updatedSession = {
    ...currentSession,
    action: 'transfer',
    asset: lastTx.asset,
    amount: lastTx.amount,
    to_address: lastTx.toAddress,
    needs_confirmation: true // V2.3: Trigger the safety summary
  };

  const summary = `${lastTx.amount} ${lastTx.asset} to ${lastTx.toAddress}`;
  
  return {
    status: 'success',
    message: `🔄 **Memory Recall:** I've found your last transaction of ${summary}. I've prepared it again for you. (Reply with "Yes" to confirm)`,
    updatedSession
  };
};

module.exports = { resolveTransactionMemory };
