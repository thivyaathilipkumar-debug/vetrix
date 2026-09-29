const axios = require('axios');
const { getBalances } = require('../services/portfolioService');

// In-Memory cache for CoinGecko to prevent Rate Limiting under heavy polling
let marketCache = {
  data: null,
  lastFetched: 0,
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 Minutes

// 1. Get Wallet Balance (Re-uses Battle-tested portfolioService)
const getBalance = async (req, res) => {
  const { address } = req.params;
  const chain = req.query.chain || 'sepolia';

  if (!address) return res.status(400).json({ error: 'Address is required' });

  try {
    const portfolio = await getBalances(address, chain);
    return res.json(portfolio);
  } catch (error) {
    console.error('Balance error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch balances' });
  }
};

// 2. Get Market Prices (No Hardcoding, 5-Min Cache)
const getMarketPriceData = async () => {
  // Return cached data if within TTL
  const now = Date.now();
  if (marketCache.data && now - marketCache.lastFetched < CACHE_TTL_MS) {
    return marketCache.data;
  }

  try {
    // We only fetch exactly what we need for the dashboard
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,usd-coin,dai&vs_currencies=usd&include_24hr_change=true',
      { timeout: 5000 }
    );

    const formattedData = {
      ETH: response.data.ethereum.usd,
      USDT: response.data.tether.usd,
      USDC: response.data['usd-coin'].usd,
      DAI: response.data.dai.usd,
    };

    // Update Cache
    marketCache.data = formattedData;
    marketCache.lastFetched = now;

    return formattedData;
  } catch (error) {
    throw new Error('Market data temporarily unavailable.');
  }
};

const getMarketPrices = async (req, res) => {
  try {
    return res.json(await getMarketPriceData());
  } catch (error) {
    console.error('CoinGecko API Error:', error.message);
    return res.status(503).json({ error: error.message });
  }
};

const { getAllContacts } = require('../utils/db');

// 3. Get Wallet History (Alchemy Native JSON-RPC)
const getHistoryData = async (address) => {
  // Use the verified active Alchemy Key
  const alchemyUrl = process.env.ALCHEMY_RPC_URL;
  if (!alchemyUrl) {
    return [];
  }

  // To get a full picture, we must fetch BOTH incoming and outgoing, including historical metadata timestamps
  const payloadOutgoing = {
    jsonrpc: '2.0', id: 1, method: 'alchemy_getAssetTransfers',
    params: [{ fromBlock: '0x0', toBlock: 'latest', fromAddress: address, category: ['external', 'erc20'], excludeZeroValue: true, maxCount: '0x14', withMetadata: true }],
  };
  
  const payloadIncoming = {
    jsonrpc: '2.0', id: 2, method: 'alchemy_getAssetTransfers',
    params: [{ fromBlock: '0x0', toBlock: 'latest', toAddress: address, category: ['external', 'erc20'], excludeZeroValue: true, maxCount: '0x14', withMetadata: true }],
  };

  try {
    const [outRes, inRes] = await Promise.all([
      axios.post(alchemyUrl, payloadOutgoing, { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }),
      axios.post(alchemyUrl, payloadIncoming, { headers: { 'Content-Type': 'application/json' }, timeout: 8000 })
    ]);

    const outTransfers = outRes.data?.result?.transfers || [];
    const inTransfers = inRes.data?.result?.transfers || [];
    
    // Combine, sort, and slice to latest
    const rawTransfers = [...outTransfers, ...inTransfers];
    
    // Load local context network for reverse lookup
    const contacts = getAllContacts(address);
    const getContactName = (addr) => {
      if (!addr) return null;
      const match = contacts.find(c => c.address.toLowerCase() === addr.toLowerCase());
      return match ? match.name : null;
    };

    const formattedHistory = rawTransfers.map((tx) => {
      const isOutgoing = tx.from.toLowerCase() === address.toLowerCase();
      const relativeAddr = isOutgoing ? tx.to : tx.from;

      return {
        hash: tx.hash,
        asset: tx.asset,
        value: tx.value?.toString() || '0',
        from: tx.from,
        to: tx.to,
        contactName: getContactName(relativeAddr),
        category: isOutgoing ? 'external' : 'receive',
        timestamp: tx.metadata?.blockTimestamp ? Date.parse(tx.metadata.blockTimestamp) : Date.now(),
      };
    });

    return formattedHistory;
  } catch (error) {
    throw new Error('Failed to fetch transaction history safely.');
  }
};

const getHistory = async (req, res) => {
  const { address } = req.params;
  if (!address) return res.status(400).json({ error: 'Address is required' });

  try {
    return res.json({ transfers: await getHistoryData(address) });
  } catch (error) {
    console.error('Alchemy History Fetch Error:', error.message);
    return res.status(503).json({ error: error.message });
  }
};

module.exports = {
  getBalance,
  getMarketPrices,
  getMarketPriceData,
  getHistory,
  getHistoryData,
};
