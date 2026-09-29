// backend/src/routes/chatRoutes.js — unchanged from V1
const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/intentController');
const { clearSession } = require('../utils/sessionStore');
const { getBalances } = require('../services/portfolioService');

// POST /api/chat — main chat endpoint
router.post('/chat', handleChat);

// POST /api/chat/clear — clear session after tx confirmed
router.post('/chat/clear', (req, res) => {
  const { session_id } = req.body;
  if (session_id) {
    clearSession(session_id);
    return res.json({ cleared: true, message: 'Session cleared successfully.' });
  }
  return res.status(400).json({ cleared: false, message: 'session_id is required.' });
});

// GET /api/portfolio/:address — dedicated portfolio endpoint
router.get('/portfolio/:address', async (req, res) => {
  const { address } = req.params;
  const chain = req.query.chain || 'sepolia';

  if (!address) {
    return res.status(400).json({ error: 'Wallet address is required.' });
  }

  try {
    const portfolio = await getBalances(address, chain);
    return res.json(portfolio);
  } catch (error) {
    console.error('Portfolio endpoint error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch portfolio.' });
  }
});

module.exports = router;
