const fs = require('fs');
const axios = require('axios');

const API_URL = 'http://localhost:3001/api/chat';
const WALLET_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Standard Hardhat #0 for testing
const OUTPUT_FILE = 'viva_test_results.md';

const queries = [
  'send 0.01 ETH',
  'what is my balance',
  'send 1 USDC',
  'explain gas fees',
  'repeat my last transaction',
  'swap 1 ETH for USDC',
  'who are you?',
  'send 0.05 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  'how much is 1 ETH in USD?',
  'add Bob with address 0x1234567890123456789012345678901234567890'
];

async function runTests() {
  console.log('🚀 Starting FINAL VIVA Backend Test (10 Queries)\n');
  
  let mdContent = `# Final VIVA Test Results\n\n`;
  mdContent += `**Wallet:** \`${WALLET_ADDRESS}\`  \n`;
  mdContent += `**Date:** ${new Date().toLocaleString()}\n\n`;
  mdContent += `| # | Query | Response | Next Step | Metadata |\n`;
  mdContent += `|---|-------|----------|-----------|----------|\n`;

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    const uniqueSessionId = `viva-session-${i}-${Date.now()}`;
    console.log(`[Query ${i + 1}/10]: "${q}"`);
    try {
      const response = await axios.post(API_URL, {
        message: q,
        session_id: uniqueSessionId,
        wallet_address: WALLET_ADDRESS
      });

      const resMsg = response.data.message.replace(/\n/g, '<br>');
      const nextStep = response.data.next_step;
      const metadata = response.data.data ? `\`${JSON.stringify(response.data.data)}\`` : '-';

      mdContent += `| ${i + 1} | ${q} | ${resMsg} | ${nextStep} | ${metadata} |\n`;
      
      console.log(`Done.`);
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      mdContent += `| ${i + 1} | ${q} | ERROR: ${errMsg} | - | - |\n`;
      console.error(`Error: ${errMsg}`);
    }
    // V3.0: 2.0s delay to prevent API rate limiting during rotation
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  fs.writeFileSync(OUTPUT_FILE, mdContent);
  console.log(`\n✅ Results saved to ${OUTPUT_FILE}`);
}

runTests();
