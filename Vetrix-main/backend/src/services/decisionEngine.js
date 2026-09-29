// backend/src/services/decisionEngine.js — V2.2 SAFETY LAYER
// Protects the bot and user from risky transactions or drained gas reserves

const { ethers } = require('ethers');
const { getWallet } = require('./walletService');

/**
 * Conducts a safety assessment before any transaction is executed.
 * Enforces hard caps (0.1 ETH) and liquidity locks (80% balance).
 * 
 * @param {string} userWallet - The address of the requesting user.
 * @param {Object} intent - The parsed intent session.
 * @returns {Promise<Object>} { approved, safetyScore, rejectionReason }
 */
const evaluateSafety = async (userWallet, intent) => {
  const result = { approved: true, safetyScore: 100, rejectionReason: null };

  try {
    // 1. Minimum Fields Check
    if (!intent.to_address || !intent.amount || !intent.asset) {
      result.rejectionReason = "Missing critical transaction fields (Recipient, Amount, or Asset).";
      result.approved = false;
      return result;
    }

    // 2. Hard Cap Check (Demo Safety: 0.1 ETH limit)
    if (intent.asset.toUpperCase() === 'ETH' && parseFloat(intent.amount) > 0.1) {
      result.rejectionReason = "Transaction exceeds demo limit of 0.1 ETH.";
      result.approved = false;
      result.safetyScore = 40;
      return result;
    }

    // 3. Liquidity Lock Check (Burner Wallet Balance Protection)
    const wallet = getWallet(); // Backend Signer
    const balance = await wallet.provider.getBalance(wallet.address);
    const balanceEth = parseFloat(ethers.formatEther(balance));

    if (intent.asset.toUpperCase() === 'ETH' && parseFloat(intent.amount) >= (balanceEth * 0.8)) {
      result.rejectionReason = "Insufficient bot reserves. Maintaining 20% gas buffer.";
      result.approved = false;
      result.safetyScore = 50;
      return result;
    }

    // 4. Address Risk (Known Burners or self-transfer)
    if (intent.to_address.toLowerCase() === wallet.address.toLowerCase()) {
      result.rejectionReason = "Self-transfer identified. Operation rejected to avoid loop.";
      result.approved = false;
      result.safetyScore = 30;
      return result;
    }

    return result;
  } catch (error) {
    console.error('[DECISION ENGINE] Inspection failure:', error.message);
    return { approved: false, safetyScore: 0, rejectionReason: 'Internal safety engine error.' };
  }
};

module.exports = { evaluateSafety };
