// backend/server.js — V2 Autonomous Agent
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./src/routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'vetrix-v3-autonomous-agent',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', chatRoutes);
app.use('/api', require('./src/routes/apiRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// V2: Verify bot wallet on startup
const { ethers } = require('ethers');
const verifyBotWallet = async () => {
  if (!process.env.BOT_PRIVATE_KEY) {
    console.warn('⚠️  BOT_PRIVATE_KEY not set — autonomous execution disabled');
    return;
  }
  try {
    const rpcUrl = process.env.ALCHEMY_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(process.env.BOT_PRIVATE_KEY, provider);
    const address = await wallet.getAddress();
    const balance = await provider.getBalance(address);
    console.log(`🤖 Bot wallet: ${address}`);
    console.log(`💰 Bot balance: ${ethers.formatEther(balance)} ETH`);
  } catch (err) {
    console.error('❌ Bot wallet verification failed:', err.message);
  }
};

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Vetrix V3 (Autonomous Agent) running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Chat:   POST http://localhost:${PORT}/api/chat`);
  console.log(`   Clear:  POST http://localhost:${PORT}/api/chat/clear`);
  console.log(`   Portfolio: GET http://localhost:${PORT}/api/portfolio/:address\n`);
  verifyBotWallet();
});

module.exports = app;
