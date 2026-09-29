// backend/src/services/web3Service.js — unchanged from V1
const { ethers } = require('ethers');

/**
 * Validates an Ethereum address (EIP-55 checksum compatible)
 */
const isValidAddress = (address) => {
  if (!address) return false;
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Validates a positive numeric amount
 */
const isValidAmount = (amount) => {
  if (!amount) return false;
  const parsed = parseFloat(amount);
  return !isNaN(parsed) && parsed > 0;
};

/**
 * Checksums an address to proper format
 */
const checksumAddress = (address) => {
  try {
    return ethers.getAddress(address);
  } catch {
    return null;
  }
};

module.exports = { isValidAddress, isValidAmount, checksumAddress };
