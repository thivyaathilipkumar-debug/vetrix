// backend/src/services/context/amountParser.js — V2.3 CONTEXT LAYER
// Resolves human-native amount intents like "half", "all", or "$10 worth"
// Uses CoinGecko for live price conversion and ethers for balance fetching

const axios = require('axios');
const { ethers } = require('ethers');
const { getChainConfig } = require('../chainService');

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

/**
 * Fetches the current USD price for a token from CoinGecko.
 * Mapping the asset name to its ID in the CoinGecko database.
 */
const getTokenPrice = async (asset = 'ETH') => {
  const assetMap = {
    'ETH': 'ethereum',
    'USDC': 'usd-coin',
    'USDT': 'tether',
    'DAI': 'dai'
  };

  const id = assetMap[asset.toUpperCase()] || 'ethereum';
  
  try {
    const response = await axios.get(`${COINGECKO_API}?ids=${id}&vs_currencies=usd`, { timeout: 5000 });
    return { price: response.data[id].usd, source: 'CoinGecko (Live)' };
  } catch (e) {
    console.error(`[CONTEXT] CoinGecko price fetch failed:`, e.message);
    // Fallback prices for demo (approx Sepolia values)
    const fallbacks = { 'ETH': 2500, 'USDC': 1, 'USDT': 1, 'DAI': 1 };
    return { price: fallbacks[asset.toUpperCase()] || 2500, source: 'Demo-Fallback (Offline Mode)' };
  }
};

/**
 * Resolves a smart amount intent (fiat-usd, relative, or numeric) into a raw token value.
 * Performs real-time price fetching from CoinGecko for fiat-native logic (e.g. "$10").
 */
const resolveSmartAmount = async (userWallet, asset, amountInput, chain = 'sepolia') => {
  if (!amountInput) return null;

  const config = getChainConfig(chain);
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  
  // 1. Fetch balance if needed for "half" or "all"
  const isSpecialAmount = ['half', 'all', 'max'].some(word => amountInput.toLowerCase().includes(word));
  const isUsdAmount = amountInput.startsWith('$') || amountInput.toLowerCase().endsWith('usd');

  if (!isSpecialAmount && !isUsdAmount) {
    // Regular numeric string
    return amountInput.replace(/[^0-9.]/g, '');
  }

  // Handle "half" or "all" - requires fetching current balance
  if (isSpecialAmount) {
    return { status: 'needs_balance', type: amountInput.toLowerCase() };
  }

  // 2. Handle USD conversion (e.g. "$10")
  if (isUsdAmount) {
    const usdValue = parseFloat(amountInput.replace(/[^0-9.]/g, ''));
    if (isNaN(usdValue)) return null;

    const priceInfo = await getTokenPrice(asset);
    const tokenAmount = usdValue / priceInfo.price;
    
    // Format to 6 decimal places for precision
    return tokenAmount.toFixed(6);
  }

  return amountInput;
};

module.exports = { resolveSmartAmount, getTokenPrice };
