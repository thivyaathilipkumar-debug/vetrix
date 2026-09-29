// backend/src/controllers/intentController.js — V2.4 FINAL CONSOLIDATED
// Core of the Vetrix Autonomous Agent. Handles intent routing, context resolution,
// trust-layer confirmations, and autonomous execution.

const { parseUserIntent } = require('../services/llmService');
const { getSession, updateSession, clearSession } = require('../utils/sessionStore');
const { getBalances } = require('../services/portfolioService');
const { estimateGas } = require('../services/gasService');
const { isValidAddress, isValidAmount } = require('../services/web3Service');
const { getChainConfig } = require('../services/chainService');
const { executeTransaction } = require('../services/walletService');
const { resolveContact, saveNewContact } = require('../services/context/contactService');
const { resolveSmartAmount, getTokenPrice } = require('../services/context/amountParser');
const { resolveTransactionMemory } = require('../services/context/memoryService');
const { logTransaction } = require('../utils/db');
const { evaluateSafety } = require('../services/decisionEngine');

/**
 * Main chat handler — processes user message, resolves context, and routes to action.
 */
const handleChat = async (req, res) => {
  try {
    const { message, session_id, wallet_address } = req.body;

    if (!message || !session_id) {
      return res.json({ next_step: 'error', message: 'Missing message or session_id.' });
    }

    const currentSession = getSession(session_id);

    // ── V2.3: PRE-FLIGHT CONFIRMATION HANDLER ────────────────────────
    const cleanMsg = message.toLowerCase().trim();
    if (currentSession.needs_confirmation) {
      if (['yes', 'confirm', 'do it', 'yup', 'ok', 'go ahead'].includes(cleanMsg)) {
        return await handleTransfer(res, wallet_address, currentSession, session_id);
      } else if (['no', 'stop', 'cancel', 'wait'].includes(cleanMsg)) {
        clearSession(session_id);
        return res.json({ next_step: 'ask_user', message: '❌ Transaction cancelled. How else can I help you?' });
      }
    }

    // Parse user intent
    const intent = await parseUserIntent(message, currentSession);
    const updatedSession = updateSession(session_id, intent);

    // ── V2.3: ERROR FORGIVENESS (SAVE CONTACT AFTER SUGGESTION) ─────
    if (updatedSession.last_status?.type === 'suggest_add' && intent.to_address && intent.to_address.startsWith('0x')) {
      try {
        saveNewContact(wallet_address, updatedSession.last_status.name, intent.to_address);
        updateSession(session_id, { last_status: null, to_address: intent.to_address });
        console.log(`[RECOVERY] Saved contact: ${updatedSession.last_status.name}`);
      } catch (e) {
        console.error('Failed to auto-save contact:', e.message);
      }
    }

    // Route based on action
    switch (updatedSession.action) {
      case 'balance': return await handleBalance(res, wallet_address, updatedSession);
      case 'transfer': return await handleTransfer(res, wallet_address, updatedSession, session_id);
      case 'repeat': return await handleRepeat(res, wallet_address, updatedSession, session_id);
      case 'add_contact': return await handleContact(res, wallet_address, updatedSession, session_id);
      case 'swap': return handleSwap(res, updatedSession);
      case 'explanation':
        return res.json({
          next_step: 'ask_user',
          message: intent.human_readable_summary || 'I can help explain blockchain concepts. What would you like to know?',
        });
      default:
        return res.json({
          next_step: 'ask_user',
          message: intent.human_readable_summary || "Hello! I'm Vetrix, your Web3 assistant. I can help you send tokens, check balances, or explain blockchain concepts.",
        });
    }
  } catch (error) {
    console.error('Intent controller error:', error.message);
    return res.json({ next_step: 'error', message: 'An internal error occurred. Please try again.' });
  }
};

/**
 * Handle balance/portfolio queries
 */
const handleBalance = async (res, walletAddress, session) => {
  if (!walletAddress) {
    return res.json({ next_step: 'ask_user', message: 'Please connect your MetaMask wallet first.' });
  }

  try {
    const portfolio = await getBalances(walletAddress, session.chain || 'sepolia');
    const balanceLines = portfolio.balances.map(b => `• ${b.asset}: ${b.amount}`).join('\n');
    const message = `Here are your balances on ${portfolio.chain}:\n\n${balanceLines}`;

    return res.json({
      next_step: 'ask_user',
      message,
      data: { action: 'balance', chain: session.chain || 'sepolia', balances: portfolio.balances, confidence: session.confidence },
    });
  } catch (error) {
    return res.json({ next_step: 'error', message: 'Unable to fetch balances.' });
  }
};

/**
 * Handle transfer intents — V2.4 CONSOLIDATED
 */
const handleTransfer = async (res, walletAddress, session, sessionId) => {
  try {
    // 1. Resolve Contact
    if (session.to_address && !session.to_address.startsWith('0x')) {
      const resolved = await resolveContact(walletAddress, session.to_address);
      if (resolved?.status === 'resolved') {
        session.to_address = resolved.address;
      } else if (resolved?.status === 'suggest_add') {
        session.last_status = { type: 'suggest_add', name: resolved.name };
        return res.json({
          next_step: 'ask_user',
          message: `🔍 I don't know "${resolved.name}" yet. Would you like to add them? Please provide their address.`,
          data: { action: 'transfer', status: 'suggest_add' }
        });
      }
    }

    // 2. Resolve Smart Amount
    if (session.amount && (session.amount.startsWith('$') || isNaN(parseFloat(session.amount)))) {
      const resolvedAmt = await resolveSmartAmount(walletAddress, session.asset, session.amount);
      if (resolvedAmt?.status === 'needs_balance') {
        return res.json({
          next_step: 'ask_user',
          message: `I need to check your balance to calculate "${session.amount}". Proceed?`,
        });
      } else if (resolvedAmt && typeof resolvedAmt === 'string') {
        session.amount = resolvedAmt;
      }
    }
  } catch (e) {
    return res.json({ next_step: 'ask_user', message: e.message });
  }

  // Gap filling
  const missingFields = [];
  if (!session.asset) missingFields.push('asset');
  if (!session.amount) missingFields.push('amount');
  if (!session.to_address) missingFields.push('to_address');

  if (missingFields.length > 0) {
    const field = missingFields[0];
    const qs = { asset: 'Which token?', amount: `How much ${session.asset || 'tokens'}?`, to_address: 'Recipient address?' };
    return res.json({ next_step: 'ask_user', message: qs[field], data: { action: 'transfer', missing_field: field } });
  }

  // Validate
  if (!isValidAddress(session.to_address)) return res.json({ next_step: 'error', message: 'Invalid recipient address.' });
  if (!isValidAmount(session.amount)) return res.json({ next_step: 'error', message: 'Invalid amount.' });

  // ── V2.3: PRE-FLIGHT CONFIRMATION ──────────────────────────────
  if (!session.needs_confirmation) {
    const safety = await evaluateSafety(walletAddress, session);
    if (!safety.approved) return res.json({ next_step: 'error', message: `🛑 SAFETY REJECTED: ${safety.rejectionReason}`, data: { safetyScore: safety.safetyScore } });

    updateSession(sessionId, { needs_confirmation: true });
    const priceInfo = await getTokenPrice(session.asset);
    const fiatValue = (parseFloat(session.amount) * priceInfo.price).toFixed(2);
    
    return res.json({
      next_step: 'ask_user',
      message: `🛡️ **Safety Check Passed.**\n\nYou are about to send **${session.amount} ${session.asset}** (~$${fiatValue}) to **${session.to_address}**.\n\nEstimated gas: ~$1.20.\n**This action is irreversible.** Proceed?`,
      data: { action: 'transfer', safetyScore: safety.safetyScore, needs_confirmation: true }
    });
  }

  // Execution
  try {
    const result = await executeTransaction(session);
    logTransaction({ userWallet: walletAddress, action: 'transfer', asset: session.asset, amount: session.amount, toAddress: session.to_address, txHash: result.txHash, status: 'pending' });
    clearSession(sessionId);
    return res.json({
      next_step: 'done',
      message: `✅ Transaction submitted! I've broadcasted ${session.amount} ${session.asset} to ${session.to_address} on Sepolia.\n\nTransaction Hash: ${result.txHash}`,
      txHash: result.txHash,
      explorer: result.explorer,
      data: { action: 'transfer', txHash: result.txHash, explorer: result.explorer, status: 'pending', statusSource: 'Verified by Decision Engine' },
    });
  } catch (error) {
    return res.json({ next_step: 'error', message: `Transaction failed: ${error.message}` });
  }
};

/** Add Contact Pivot */
const handleContact = async (res, walletAddress, session, sessionId) => {
  const name = session.amount; const address = session.to_address;
  if (!name || !address) return res.json({ next_step: 'ask_user', message: 'Provide name and address.' });
  try {
    saveNewContact(walletAddress, name, address); clearSession(sessionId);
    return res.json({ next_step: 'done', message: `✅ Contact ${name} saved!` });
  } catch (e) { return res.json({ next_step: 'error', message: e.message }); }
};

/** Memory Recall */
const handleRepeat = async (res, walletAddress, session, sessionId) => {
  const result = await resolveTransactionMemory(walletAddress, session);
  if (result.status === 'success') {
    updateSession(sessionId, result.updatedSession);
    return await handleTransfer(res, walletAddress, result.updatedSession, sessionId);
  }
  return res.json({ next_step: 'ask_user', message: result.message });
};

const handleSwap = (res, session) => res.json({ next_step: 'ask_user', message: 'Swaps are coming soon!' });

module.exports = { handleChat };
