// backend/src/services/gasService.js — unchanged from V1
const { ethers } = require('ethers');
const { getChainConfig } = require('./chainService');
const { getTokenAddress } = require('./tokenService');

const estimateGas = async (chainName, action, asset, amount, toAddress, walletAddress) => {
  const config = getChainConfig(chainName || 'sepolia');
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);

  try {
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');

    let gasLimit;
    const tokenAddress = getTokenAddress(chainName || 'sepolia', asset);

    if (asset === 'ETH' || asset === 'MATIC' || !tokenAddress) {
      // Native token transfer — standard 21000 gas
      gasLimit = BigInt(21000);
    } else {
      // ERC20 transfer — estimate from contract
      const erc20Interface = new ethers.Interface([
        'function transfer(address to, uint256 amount) returns (bool)',
      ]);
      const decimals = (asset === 'USDC' || asset === 'USDT') ? 6 : 18;
      const data = erc20Interface.encodeFunctionData('transfer', [
        toAddress || '0x0000000000000000000000000000000000000001',
        ethers.parseUnits(amount || '1', decimals),
      ]);

      gasLimit = await provider.estimateGas({
        from: walletAddress,
        to: tokenAddress,
        data,
      }).catch(() => BigInt(65000)); // fallback for estimation failure
    }

    const gasCostWei = gasLimit * gasPrice;
    const gasCostEth = parseFloat(ethers.formatEther(gasCostWei)).toFixed(8);

    return {
      gasLimit: gasLimit.toString(),
      gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' Gwei',
      estimatedCostEth: gasCostEth,
      estimatedCostUsd: (parseFloat(gasCostEth) * 2500).toFixed(4),
    };
  } catch (error) {
    console.error('Gas estimation error:', error.message);
    return {
      gasLimit: '65000',
      gasPrice: '20 Gwei',
      estimatedCostEth: '0.00130000',
      estimatedCostUsd: '3.2500',
    };
  }
};

module.exports = { estimateGas };
