// backend/src/services/chainService.js — unchanged from V1

const CHAINS = {
  sepolia: {
    id: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: process.env.ALCHEMY_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    nativeToken: 'ETH',
    explorer: 'https://sepolia.etherscan.io'
  },
  ethereum: {
    id: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    nativeToken: 'ETH',
    explorer: 'https://etherscan.io'
  },
  polygon: {
    id: 137,
    name: 'Polygon PoS',
    rpcUrl: 'https://polygon.llamarpc.com',
    nativeToken: 'MATIC',
    explorer: 'https://polygonscan.com'
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    nativeToken: 'ETH',
    explorer: 'https://arbiscan.io'
  }
};

const getChainConfig = (chainName) => {
  if (!chainName) return CHAINS.sepolia;
  return CHAINS[chainName.toLowerCase()] || CHAINS.sepolia;
};

const getChainById = (chainId) => {
  const numId = typeof chainId === 'string' ? parseInt(chainId) : chainId;
  return Object.values(CHAINS).find(c => c.id === numId) || CHAINS.sepolia;
};

module.exports = { CHAINS, getChainConfig, getChainById };
