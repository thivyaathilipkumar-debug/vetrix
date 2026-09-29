// backend/src/services/walletService.js — NEW IN V2
// Signs and broadcasts transactions from the bot's burner wallet
// The burner wallet holds only Sepolia testnet ETH — zero real-world value

const { ethers } = require('ethers');
const { getChainConfig } = require('./chainService');
const { getTokenAddress, ERC20_ABI, TOKEN_DECIMALS } = require('./tokenService');
require('dotenv').config();

/**
 * Creates an ethers.Wallet instance connected to the chain's RPC provider.
 * Uses BOT_PRIVATE_KEY from environment — the burner wallet.
 */
const getWallet = (chainName = 'sepolia') => {
  const config = getChainConfig(chainName);
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);

  if (!process.env.BOT_PRIVATE_KEY) {
    throw new Error('BOT_PRIVATE_KEY not set in environment');
  }

  return new ethers.Wallet(process.env.BOT_PRIVATE_KEY, provider);
};

/**
 * Executes a transaction autonomously from the bot's burner wallet.
 * Supports native ETH transfers and ERC20 token transfers.
 * 
 * @param {Object} session - The completed session object with all fields populated
 * @returns {Object} { success, txHash, explorer }
 */
const executeTransaction = async (session) => {
  const { action, asset, amount, to_address, chain } = session;
  const wallet = getWallet(chain || 'sepolia');
  const chainConfig = getChainConfig(chain || 'sepolia');

  console.log(`[V2 EXEC] Executing ${action}: ${amount} ${asset} → ${to_address} on ${chainConfig.name}`);

  // ── NATIVE ETH TRANSFER ────────────────────────────────────
  if (action === 'transfer' && (!asset || asset === 'ETH')) {
    const tx = {
      to: to_address,
      value: ethers.parseEther(amount),
    };

    const sent = await wallet.sendTransaction(tx);
    console.log(`[V2 EXEC] TX broadcast: ${sent.hash} — waiting for confirmation...`);

    const receipt = await sent.wait(); // wait for block confirmation
    console.log(`[V2 EXEC] TX confirmed in block ${receipt.blockNumber}`);

    return {
      success: true,
      txHash: receipt.hash,
      explorer: `${chainConfig.explorer}/tx/${receipt.hash}`,
    };
  }

  // ── ERC20 TOKEN TRANSFER ───────────────────────────────────
  if (action === 'transfer' && asset !== 'ETH') {
    const tokenAddress = getTokenAddress(chain || 'sepolia', asset);
    if (!tokenAddress) {
      throw new Error(`Token ${asset} not found on ${chain || 'sepolia'}`);
    }

    const decimals = TOKEN_DECIMALS[asset.toUpperCase()] ?? 18;
    const erc20 = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

    const sent = await erc20.transfer(
      to_address,
      ethers.parseUnits(amount, decimals)
    );
    console.log(`[V2 EXEC] ERC20 TX broadcast: ${sent.hash} — waiting for confirmation...`);

    const receipt = await sent.wait();
    console.log(`[V2 EXEC] ERC20 TX confirmed in block ${receipt.blockNumber}`);

    return {
      success: true,
      txHash: receipt.hash,
      explorer: `${chainConfig.explorer}/tx/${receipt.hash}`,
    };
  }

  throw new Error(`Unsupported action for execution: ${action}`);
};

module.exports = { executeTransaction, getWallet };
