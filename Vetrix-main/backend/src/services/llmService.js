// backend/src/services/llmService.js — V3.1 VIVA STABLE
const axios = require('axios');
const { z } = require('zod');
const SYSTEM_PROMPT = require('../utils/systemPrompt');
require('dotenv').config();

const apiKey = (process.env.GEMINI_API_KEY || '').trim();

// V3.1: Use the exact model strings verified from the API itself
const MODELS = [
  'models/gemini-2.5-flash',
  'models/gemini-3.1-flash-live-preview',
  'models/gemini-1.5-flash',
  'models/gemini-pro'
];

const IntentSchema = z.object({
  intent_detected: z.boolean(),
  action: z.enum(['transfer', 'swap', 'balance', 'explanation', 'repeat', 'add_contact', 'unknown']),
  chain: z.enum(['ethereum', 'polygon', 'arbitrum', 'sepolia']).nullable(),
  asset: z.enum(['ETH', 'USDC', 'USDT', 'DAI']).nullable(),
  amount: z.string().nullable(),
  to_address: z.string().nullable(),
  swap: z.object({
    from: z.string().nullable(),
    to: z.string().nullable(),
    amount: z.string().nullable(),
  }).nullable(),
  confidence: z.number().min(0).max(1),
  human_readable_summary: z.string(),
  risk_flags: z.array(z.string()),
});

const parseUserIntent = async (userMessage, sessionState = {}) => {
  for (const modelPath of MODELS) {
    try {
      // V3.1: The correct URL format for raw axios calls is https://.../v1beta/{model_name}:generateContent
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent`;
      
      const payload = {
        contents: [{
          parts: [{
            text: `${SYSTEM_PROMPT}\n\nCONTEXT:\n${JSON.stringify(sessionState)}\n\nUSER INPUT:\n${userMessage}\n\nRESPONSE (JSON ONLY):`
          }]
        }]
      };

      const response = await axios.post(url, payload, {
        headers: { 'x-goog-api-key': apiKey },
        timeout: 15000
      });

      const text = response.data.candidates[0].content.parts[0].text;
      let jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
      const first = jsonStr.indexOf('{');
      const last = jsonStr.lastIndexOf('}');
      if (first !== -1 && last !== -1) {
        jsonStr = jsonStr.substring(first, last + 1);
      }

      return IntentSchema.parse(JSON.parse(jsonStr));
    } catch (error) {
      console.warn(`[VIVA RECOVERY] Model ${modelPath} failed: ${error.message}`);
      // Cycle to next model
    }
  }

  return {
    intent_detected: false,
    action: 'unknown',
    chain: null,
    asset: null,
    amount: null,
    to_address: null,
    swap: null,
    confidence: 0,
    human_readable_summary: 'My intelligence layer is currently under high load. Please try again in 30 seconds.',
    risk_flags: ['API Overload'],
  };
};

module.exports = { parseUserIntent, IntentSchema };
