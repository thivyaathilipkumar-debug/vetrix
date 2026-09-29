// backend/src/config/env.js
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  ALCHEMY_RPC_URL: process.env.ALCHEMY_RPC_URL,
  BOT_PRIVATE_KEY: process.env.BOT_PRIVATE_KEY,
};
