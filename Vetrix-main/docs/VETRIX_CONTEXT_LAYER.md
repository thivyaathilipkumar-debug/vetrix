# 🧠 Vetrix V2.1 — The Context Intelligence Layer

The **Context Intelligence Layer** is the core differentiator of Vetrix Version 2.1. It solves the "Technical Barrier" in Web3 by shifting the platform interaction from **blockchain-native commands** to **human-native conversation**.

## 1. Why the "Context Layer" Matters?
Most Web3 systems today are built for developers, requiring manual input for addresses, decimals, and gas calculations. Vetrix solves the three biggest pain points:
1. **The Address Pain:** No more 0x copy-pasting.
2. **The Unit Pain:** No more manual conversion from USD to ETH/ERC20.
3. **The Repeat Pain:** No more repeating the same parameters every time.

## 2. Key Components

### 📇 Contact Book Management (`contactService.js`)
Users can save their contacts locally. 
- **Learning Turn:** "Add John as 0x742..." ➝ Saves to metadata.
- **Resolution Turn:** "Send to John" ➝ Translates to address.
- **FYP Context:** Demonstrates **Persistence & Identity Mapping**.

### 💰 Smart Amount Parsing (`amountParser.js`)
Vetrix understands how humans think about crypto amounts:
- **Relative Values:** "Send half my ETH."
- **Fiat-Primary:** "Send $5 of ETH" ➝ **CoinGecko** dynamic price fetch.
- **Max Values:** "Send all my USDC."
- **FYP Context:** Demonstrates **External API Integration & Dynamic Value Resolution**.

### 🧠 Transaction Memory (`memoryService.js`)
The bot maintains a session history that allows for recall.
- **Context Recall:** "Same as last time" ➝ Pulls the last successful `amount`, `asset`, and `to_address` from the audit log.
- **FYP Context:** Demonstrates **State Persistence & Transaction Lineage**.

## 3. Implementation Logic
The Context Layer sits comfortably between the LLM parser and the blockchain execution engine. 

1. **LLM** ➝ Extracts "vague" human values.
2. **Context Layer** ➝ Resolves values into "strict" blockchain parameters.
3. **Execution Engine** ➝ Broadcasts the finalized transaction.

## 4. Academic Contribution
"Vetrix V2.1 introduces a **Context Intelligence Layer** that acts as a cognitive bridge between unstructured human intent and structured cryptographic execution. By offloading complex resolution (contacts/amounts) into a dedicated service layer, the system significantly reduces user cognitive load and transaction friction." 
