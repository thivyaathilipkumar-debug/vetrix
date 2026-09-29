// backend/src/services/portfolioService.js — unchanged from V1
const { ethers } = require('ethers');
const { getChainConfig } = require('./chainService');
const { TOKENS, ERC20_ABI } = require('./tokenService');

const getBalances = async (walletAddress, chainName = 'sepolia') => {
  const config = getChainConfig(chainName);
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const balances = [];

  try {
    // Native token balance (ETH)
    const nativeBal = await provider.getBalance(walletAddress);
    balances.push({
      asset: config.nativeToken,
      amount: parseFloat(ethers.formatEther(nativeBal)).toFixed(6),
      isNative: true,
      contractAddress: null,
    });

    // ERC20 token balances
    const tokenMap = TOKENS[chainName.toLowerCase()] || {};
    for (const [ticker, address] of Object.entries(tokenMap)) {
      try {
        const contract = new ethers.Contract(address, ERC20_ABI, provider);
        const [rawBal, decimals] = await Promise.all([
          contract.balanceOf(walletAddress),
          contract.decimals(),
        ]);
        balances.push({
          asset: ticker,
          amount: parseFloat(ethers.formatUnits(rawBal, decimals)).toFixed(4),
          isNative: false,
          contractAddress: address,
        });
      } catch (e) {
        console.error(`Error fetching ${ticker} balance:`, e.message);
        balances.push({
          asset: ticker,
          amount: '0.0000',
          isNative: false,
          contractAddress: address,
        });
      }
    }

    return {
      balances,
      chain: config.name,
      chainId: config.id,
      address: walletAddress,
    };
  } catch (error) {
    console.error('Portfolio fetch error:', error.message);
    return {
      balances: [],
      chain: config.name,
      chainId: config.id,
      address: walletAddress,
      error: 'RPC connection failed. Please check your network configuration.',
    };
  }
};

module.exports = { getBalances };
