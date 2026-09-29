// backend/src/services/context/contactService.js — V2.3 CONTEXT LAYER
// Resolves human-native names to blockchain addresses via persistent edge-store

const { addContact, getContact } = require('../../utils/db');
const { ethers } = require('ethers');

/**
 * Resolves a human-native name or address input into a verified blockchain identity.
 * Checks the user's local contact book to perform name-to-address mapping.
 * 
 * @param {string} userWallet - The address of the current connected user.
 * @param {string} input - The raw address or name from the user intent.
 * @returns {Promise<Object>} - Resolved address, name, and status.
 */
const resolveContact = async (userWallet, input) => {
  if (!input) return null;

  // 1. Check if input is ALREADY a valid 0x address
  if (ethers.isAddress(input)) {
    return { address: input, name: null, status: 'resolved' };
  }

  // 2. Check if name exists in the user's contact book
  const contact = getContact(userWallet, input);
  
  if (contact) {
    console.log(`[CONTEXT] Resolved contact "${input}" to ${contact.address}`);
    return { address: contact.address, name: contact.name, status: 'resolved' };
  }

  // 3. Not an address and not a known contact
  // V2.3: Suggest add state for 'Error Forgiveness' logic
  console.log(`[CONTEXT] Name "${input}" not found. Suggesting add...`);
  return { address: null, name: input, status: 'suggest_add' };
};

/**
 * Adds a new contact to the user's book
 */
const saveNewContact = (userWallet, name, address) => {
  if (!ethers.isAddress(address)) {
    throw new Error(`Cannot add contact: "${address}" is not a valid Ethereum address.`);
  }
  
  return addContact(userWallet, name, address);
};

module.exports = { resolveContact, saveNewContact };
