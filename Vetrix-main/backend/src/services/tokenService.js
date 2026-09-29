// backend/src/services/tokenService.js — unchanged from V1

const TOKENS = {
  sepolia: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    USDT: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
    DAI:  '0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6',
  },
  ethereum: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI:  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    DAI:  '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  },
  arbitrum: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    DAI:  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  }
};

const TOKEN_DECIMALS = {
  ETH: 18,
  USDC: 6,
  USDT: 6,
  DAI: 18,
  MATIC: 18,
};

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

const getTokenAddress = (chainName, tokenSymbol) => {
  if (!chainName || !tokenSymbol) return null;
  if (tokenSymbol.toUpperCase() === 'ETH' || tokenSymbol.toUpperCase() === 'MATIC') return null;
  const chainTokens = TOKENS[chainName.toLowerCase()];
  if (!chainTokens) return null;
  return chainTokens[tokenSymbol.toUpperCase()] || null;
};

const getTokenDecimals = (tokenSymbol) => {
  if (!tokenSymbol) return 18;
  return TOKEN_DECIMALS[tokenSymbol.toUpperCase()] ?? 18;
};

module.exports = { TOKENS, TOKEN_DECIMALS, ERC20_ABI, getTokenAddress, getTokenDecimals };
