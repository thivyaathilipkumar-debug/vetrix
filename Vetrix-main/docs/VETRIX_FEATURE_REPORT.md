# 📊 Vetrix V2 — Codebase & Architecture Report

This document outlines the current state of the Vetrix V2 codebase, the verified working features, and the internal data flow of the architecture.

## 1. Codebase Structure

The repository is structured as a standard monorepo separating concerns completely between the presentation layer (`frontend`) and the agent execution layer (`backend`).

### Backend Core (`/backend/src/`)
- **`controllers/intentController.js`**: The central brain router. It processes user chat requests, invokes the LLM, tracks session state across multiple messages, handles gap filling, and triggers blockchain operations depending on the parsed intent.
- **`services/llmService.js`**: Interfaces with Google Gemini 2.0 Flash SDK. Parses the user's natural text into a strict, predefined JSON schema using `zod`. Extracts action type, tokens, amounts, chains, and risk flags.
- **`services/walletService.js` [V2 NEW]**: Houses the Autonomous Execution engine. It spins up an `ethers.Wallet` bound to the backend's environment securely injected `BOT_PRIVATE_KEY`. Responsible for signing and broadcasting both Native (ETH) and ERC20 Token transfers directly to the blockchain.
- **`services/portfolioService.js`**: Fetches real-time native and token balances for the user’s connected wallet by querying the RPC node.
- **`services/gasService.js`**: Simulates and estimates gas costs by fetching current fee data on the blockchain.
- **`utils/sessionStore.js`**: An in-memory cache system maintaining intent context (like amount or recipient) so users can build a transaction parameter over multiple conversational turns.

### Frontend Core (`/frontend/src/`)
- **`context/WalletContext.tsx`**: Globally wraps the application in an `ethers.js` `BrowserProvider` state, communicating with MetaMask to expose the user's connected wallet address for portfolio viewing.
- **`components/ChatInterface.tsx`**: The main interface loop. Connects directly to the `intentController.js` via REST API. It handles parsing the various response actions (like `ask_user`, `error`, `done`) and dynamically maps them to beautiful UI frames, including embedding clickable Etherscan badges upon successful agent execution.

---

## 2. Currently Working Features (Verified)

### ✅ Autonomous Transaction Execution (Sepolia)
- **Native ETH Transfers:** The bot successfully formats `ethers.parseEther` payload, signs via its burner wallet, broadcasts it, awaits confirmation, and returns the `<hash>` string transparently to the user.
- **ERC20 Token Transfers:** Supports testnet USDC, USDT, and DAI. Automatically resolves the custom token ABI, formats using precise `decimals()`, and performs `erc20.transfer()` logic natively securely avoiding UI extensions. 
- **Gas Self-Funding:** The backend handles the gas payments entirely out of the burner wallet reserves. The frontend user pays nothing to execute the transaction.

### ✅ Multi-Turn Intent Parsing (Mental Memory)
- Tested and functioning correctly: A user can say `"I want to send ETH"`. The bot recognizes `action: transfer`, `asset: ETH`, but correctly flags `amount: null`, `to_address: null`. The bot holds this memory in the `sessionStore` and actively prompts the user to fill the remaining slots before firing the execution process.

### ✅ Real-Time Portfolio Tracking
- Backend directly connects an autonomous node link (Alchemy) to query custom smart contract `balanceOf()` calls and parses them back nicely into the UI sidebar framework using `PortfolioService`.

---

## 3. Data Flow Execution Sequence (The "Flow")

Here is exactly what happens when a user types `"Send 0.05 ETH to 0x123..."` and presses enter:

1. **Frontend Request** -> `ChatInterface.tsx` fires a POST to `/api/chat` with `{ message: "Send...", session_id: "abc", wallet_address: "0xDef" }`.
2. **Intent Pipeline** -> `intentController.js` catches the request. It retrieves any existing temporary memory for `"abc"`.
3. **AI Evaluation** -> The parameters are passed to `llmService.parseUserIntent()`. Gemini acts as a strict function parser, bypassing chat, outputting raw JSON mapping `amount` to `0.05` and `to_address` to `0x123...`. 
4. **Validation Check** -> `zod` schema throws an error if Gemini hallucinated formatting. If safe, it proceeds.
5. **Execution Trigger** -> Because `action == 'transfer'` and all required variables exist, `intentController` jumps out of conversation mode and triggers `walletService.executeTransaction(session)`.
6. **Blockchain Signing** -> `walletService` loads the backend `BOT_PRIVATE_KEY` burner address. It structures the Native Tx payload.
7. **Broadcast & Wait** -> `wallet.sendTransaction()` fires it into the mempool. `sent.wait()` locks the backend process specifically until the transaction is mined into a block by Sepolia validators.
8. **Final UI Dispatch** -> Once confirmed, `intentController` wipes the memory session and returns `next_step: 'done'` to the frontend alongside the valid transaction hash for Etherscan. The user interface updates green. 

*(Future Work: Smart contract interactions involving 'swaps' and 'allowances' are mapped theoretically but handled via fallback message due to Sepolia testnet liquidity constraints).*
