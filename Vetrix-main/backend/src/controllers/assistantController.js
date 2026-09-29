const axios = require('axios');
const { ethers } = require('ethers');
const { getBalances } = require('../services/portfolioService');
const { getHistoryData, getMarketPriceData } = require('./apiController');

const MAX_MESSAGE_LENGTH = 1000;
const GEMINI_TIMEOUT_MS = 12000;

const needsMarketData = (message) => /price|market|portfolio|worth|\busd\b|\bvalue\b/i.test(message);
const needsVerifiedAnswer = (message) => /price|market|balance|how much|hold|assets?|transaction|activity|unusual|portfolio|worth|\busd\b/i.test(message);

const buildFallbackAnswer = (message, context) => {
  const query = message.toLowerCase();
  const walletQuery = /wallet|balance|portfolio|asset|hold|transaction|activity|how much/i.test(query);
  if (walletQuery && !context.walletAddress) {
    return 'Connect a wallet first so I can retrieve its actual balances and transaction history.';
  }

  if (/price|market/i.test(query)) {
    if (!context.marketPrices) return 'Live market data is currently unavailable, so I cannot provide a current price.';
    const asset = /\b(eth|ethereum)\b/i.test(query) ? 'ETH' : null;
    if (asset && context.marketPrices[asset] != null) return `The current ETH price is $${context.marketPrices[asset]} USD, based on the latest available market data.`;
    return `Latest available market prices (USD): ${Object.entries(context.marketPrices).map(([name, price]) => `${name}: $${price}`).join(', ')}.`;
  }

  if (/transaction|activity|unusual|recent/i.test(query)) {
    if (context.historyError) return `I could not retrieve transaction history: ${context.historyError}`;
    const transfers = context.history || [];
    if (transfers.length === 0) return 'No recent transactions were returned for this wallet.';
    const summary = transfers.slice(0, 5).map((tx) => `${tx.category === 'external' ? 'Sent' : 'Received'} ${tx.value} ${tx.asset || 'token'}`).join('; ');
    if (/unusual/i.test(query)) return `I cannot determine whether activity is unusual without a longer baseline. Recent transactions: ${summary}.`;
    return `Recent wallet activity: ${summary}. This summary reflects the transaction records returned by the wallet history service.`;
  }

  if (/portfolio|\bworth\b|\busd\b/i.test(query)) {
    if (context.portfolioValueUsd == null) return 'I cannot calculate a portfolio value because current balances or live market prices are unavailable.';
    return `The estimated portfolio value is $${context.portfolioValueUsd.toFixed(2)} USD, calculated from the retrieved balances and current market prices.`;
  }

  if (/balance|how much|hold|asset|portfolio/i.test(query)) {
    if (context.balanceError) return `I could not retrieve wallet balances: ${context.balanceError}`;
    const balances = context.balances || [];
    return `Retrieved wallet balances: ${balances.map(({ asset, amount }) => `${amount} ${asset}`).join(', ') || 'no balance entries were returned'}.`;
  }

  return 'I can help explain wallet balances, assets, recent transactions, portfolio value, and current market prices. Connect a wallet for account-specific answers.';
};

const requestGeminiAnswer = async (message, context) => {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;

  const model = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').replace(/^models\//, '');
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      contents: [{ parts: [{ text: [
        'You are Vetrix, a read-only financial and wallet assistant. Answer the user using only the supplied context.',
        'Never invent balances, transactions, addresses, prices, or live data. If a fact is unavailable, say so plainly.',
        'Distinguish wallet facts from market data and your explanations. Do not initiate or recommend transactions, promise returns, or present yourself as a professional financial adviser.',
        'Keep the answer concise and explain uncertainty.',
        `VERIFIED CONTEXT JSON: ${JSON.stringify(context)}`,
        `USER QUESTION: ${message}`,
      ].join('\n\n') }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
    },
    { headers: { 'x-goog-api-key': apiKey }, timeout: GEMINI_TIMEOUT_MS }
  );

  const answer = response.data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();
  if (!answer) throw new Error('AI returned an empty or invalid response.');
  return answer;
};

const handleAssistant = async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const walletAddress = req.body?.walletAddress;

  if (!message) return res.status(400).json({ success: false, error: 'A non-empty message is required.' });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ success: false, error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` });
  }
  if (walletAddress != null && (typeof walletAddress !== 'string' || !ethers.isAddress(walletAddress))) {
    return res.status(400).json({ success: false, error: 'walletAddress must be a valid Ethereum address.' });
  }

  const context = {
    walletAddress: walletAddress || null,
    balances: null,
    balanceError: null,
    history: null,
    historyError: null,
    marketPrices: null,
    marketError: null,
    portfolioValueUsd: null,
  };

  if (walletAddress) {
    const [balanceResult, historyResult] = await Promise.allSettled([
      getBalances(walletAddress),
      process.env.ALCHEMY_RPC_URL
        ? getHistoryData(walletAddress)
        : Promise.reject(new Error('Transaction history is unavailable because ALCHEMY_RPC_URL is not configured.')),
    ]);

    if (balanceResult.status === 'fulfilled' && !balanceResult.value.error) {
      context.balances = balanceResult.value.balances;
    } else {
      context.balanceError = balanceResult.status === 'rejected'
        ? balanceResult.reason.message
        : balanceResult.value.error || 'Wallet balance service is unavailable.';
    }
    if (historyResult.status === 'fulfilled') context.history = historyResult.value;
    else context.historyError = historyResult.reason.message || 'Wallet history service is unavailable.';
  }

  if (needsMarketData(message)) {
    try {
      context.marketPrices = await getMarketPriceData();
    } catch (error) {
      context.marketError = error.message || 'Live market data is unavailable.';
    }
  }

  if (context.balances && context.marketPrices) {
    const valuedBalances = context.balances.filter((balance) => Number.isFinite(Number(balance.amount)) && Number.isFinite(context.marketPrices[balance.asset]));
    if (valuedBalances.length > 0) {
      context.portfolioValueUsd = valuedBalances.reduce((sum, balance) => sum + Number(balance.amount) * context.marketPrices[balance.asset], 0);
    }
  }

  const aiConfigured = Boolean((process.env.GEMINI_API_KEY || '').trim());
  let answer;
  let aiUsed = false;
  let aiRequestFailed = false;
  if (aiConfigured) {
    try {
      answer = await requestGeminiAnswer(message, context);
      aiUsed = true;
    } catch (error) {
      console.error('Assistant Gemini request failed:', error.message);
      aiRequestFailed = true;
    }
  }
  if (!answer || needsVerifiedAnswer(message)) {
    answer = buildFallbackAnswer(message, context);
    aiUsed = false;
    if (!aiConfigured || aiRequestFailed) {
      answer += aiConfigured
        ? '\n\nGemini is currently unavailable; this response uses available backend data only.'
        : '\n\nAI configuration is unavailable (GEMINI_API_KEY is not set); this response uses available backend data only.';
    }
  }

  return res.json({
    success: true,
    answer,
    data: {
      walletAddress: walletAddress || null,
      aiConfigured,
      aiUsed,
      sources: {
        wallet: context.balances ? 'backend wallet service' : context.balanceError ? 'unavailable' : 'not requested',
        history: context.history ? 'backend wallet history service' : context.historyError ? 'unavailable' : 'not requested',
        market: context.marketPrices ? 'CoinGecko' : context.marketError ? 'unavailable' : 'not requested',
      },
    },
  });
};

module.exports = { handleAssistant };