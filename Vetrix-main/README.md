# 🛡️ Vetrix — Research-Grade Autonomous Web3 Agent

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?logo=nodedotjs)
![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-purple)
![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash-orange)

**Vetrix** is an advanced autonomous Web3 assistant built as a Final Year Project constraint. Unlike standard dApps where users must manually click through MetaMask popups to sign transactions, **Vetrix handles execution entirely on the server via a dedicated "burner wallet"**.

You just type naturally. Vetrix understands your intent, requests missing details, verifies balances, and autonomously executes blockchain transactions on your behalf.

<p align="center">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHUyNWFwcWh4N2dudDhmMnVyOHcxdjYzemF5ZTh2bTI0aDhlYXF1NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1R1tvI9svkIWwpVYr/giphy.gif" alt="Vetrix Banner" width="400"/>
</p>

## ✨ Key Features

- 🧠 **Context Intelligence Layer:** Vetrix converts human-native names (e.g., "John") and fiat-native values (e.g., "$10 worth") into precise blockchain parameters via a local persistent identity store and **CoinGecko** price feeds.
- 🔄 **Transaction Context Recall:** Remembers your history. "Send the same as last time" autonomously pre-fills recipients and amounts from the audit log.
- 📇 **Persistent Contact Book:** Zero-Setup local database managing custom name-to-address mappings for a friction-less experience.
- 🤖 **Neural Processing UI:** Features a high-fidelity interaction layer with real-time feedback, processing transaction intents with zero-latency visual confirmation.
- 💬 **AI Financial Assistant:** Answers read-only wallet, transaction, portfolio, and market questions using backend wallet data and Gemini when configured. It falls back to data-based responses if Gemini is unavailable.
- 🛡️ **Autonomous Shield Guard:** A deterministic multi-factor controller that enforces `min(0.1 ETH, 80% balance)` safety thresholds and protects gas reserves.
- 📜 **Verifiable Execution Model:** Maps natural language intent directly to on-chain `txHash` in a persistent audit trail.

## 📚 Project Documentation

To understand the architecture, UI design, and development lifecycle of Aura V3.0, please refer to the following internal documents:

- 📘 **[Project Plan](./docs/VETRIX_PROJECT_PLAN.md)** — The academic evolution, technical stack, and feature summary.
- 🚀 **[Handover & UI Blueprint](./docs/VETRIX_HANDOVER_BLUEPRINT.md)** — A complete guide for successors, detailing the Neural UI and technical architecture.
- 📋 **[Test Manifest](./docs/VETRIX_TEST_MANIFEST.md)** — Step-by-step presentation manual to verify every feature.
- 📊 **[Codebase & Feature Report](./docs/VETRIX_FEATURE_REPORT.md)** — Details codebase structure and verified working features.
- ⚙️ **[Architecture Overview](./docs/VETRIX_ARCHITECTURE.md)** — System overviews, core component relationships, and data flow.
- 🔄 **[User Workflow Blueprint](./docs/VETRIX_WORKFLOW.md)** — Step-by-step lifecycle of an autonomous transaction execution.
- 🧠 **[Context Layer Deep Dive](./docs/VETRIX_CONTEXT_LAYER.md)** — Breakdown of memory, identity mapping, and price rendering details.
- ✅ **[QA Report](./docs/VETRIX_QA_REPORT.md)** — Testing history and error handling validations.

## 🏗️ Version 2 Architecture Transition

In V1 (Non-Custodial), the bot was simply an intent parser that prepared transaction payloads for the user to manually sign in their browser extension. 

In **V2 (Vetrix Agent)**, the architecture shifts execution logic to the backend:
1. **Natural Input:** User types "Send 0.05 Sepolia ETH to Vitalik."
2. **Neural Parsing:** Gemini 2.0 extracts parameters and Zod validates the schema.
3. **Shield Verification:** Vetrix verifies balances and gas thresholds via the Guardrail engine.
4. **Execution:** The backend signs the transaction with the `BOT_PRIVATE_KEY` and broadcasts via Alchemy.
5. **Real-time Pulse:** The user receives a clickable Etherscan hash and a "pulsing shield" UI status while the block confirms.

---

## 🛠️ Tech Stack

### Frontend (User Interface)
- **Framework:** Next.js (App Router), React 19
- **Styling:** Tailwind CSS V4, Framer Motion
- **Web3 Integration:** `ethers.js` (BrowserProvider) 

### Backend (Agent Brain & Context)
- **Server:** Node.js, Express.js
- **Intelligence:** `@google/generative-ai` (Gemini SDK)
- **Data Layer:** Lightweight Edge-Persistence (JSON-based audit & contact store)
- **Pricing:** **CoinGecko API** for real-time USD conversion
- **Web3 Engine:** `ethers.js` (V6) for server-side signing and broadcast
- **Validation:** `zod` for strict intent schema enforcement

---

## 🚀 Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/en/) installed and an Alchemy API Key.

### 1. Environment Variables Setup

You must create two `.env` files. 

**Backend (`backend/.env`):**
```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
PORT=3001
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
BOT_PRIVATE_KEY=your_burner_wallet_private_key
```
> **Note:** The `BOT_PRIVATE_KEY` must have real Sepolia ETH to pay for transaction gas! Use a free Sepolia Faucet to fund it.

**Frontend (`frontend/.env`):**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/chat
```

### 2. Installation & Running

Open two separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with Vetrix!

## 💬 AI Financial Assistant

Open the existing dashboard at `http://localhost:3000/chat` and select **Financial** in the chat panel. The assistant is read-only and does not submit transactions. Wallet answers use the existing backend balance and history sources; live prices use the existing CoinGecko data source. When Gemini is unavailable, it returns a clearly labeled data-based fallback.

### API

`POST http://localhost:3001/api/assistant`

Request:
```json
{
  "message": "What is my wallet balance?",
  "walletAddress": "0x0000000000000000000000000000000000000000"
}
```

`walletAddress` is optional for general questions such as current ETH price. If supplied, it must be a valid Ethereum address.

Response:
```json
{
  "success": true,
  "answer": "Retrieved wallet balances: ...",
  "data": {
    "walletAddress": "0x0000000000000000000000000000000000000000",
    "aiConfigured": true,
    "aiUsed": true,
    "sources": {
      "wallet": "backend wallet service",
      "history": "backend wallet history service",
      "market": "not requested"
    }
  }
}
```

The endpoint rejects empty messages, messages longer than 1,000 characters, and invalid wallet addresses. Wallet, market, Gemini, and timeout failures are handled without taking down the backend. Gemini is instructed to use only the supplied context; API keys remain on the backend.

### Environment Variables

Set these in `backend/.env` (never expose or commit this file):
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

`GEMINI_API_KEY` is optional: without it, the assistant reports that AI configuration is unavailable and uses available backend data. `ALCHEMY_RPC_URL` is needed for wallet balances and transaction history. Market prices are retrieved from CoinGecko by the backend. Do not add `GEMINI_API_KEY` to any `NEXT_PUBLIC_*` frontend variable.

### Run and Test

Start the services in separate terminals from the project directory:
```bash
cd backend
npm install
npm run dev
```
```bash
cd frontend
npm install
npm run dev
```

Use `http://localhost:3000/chat`. Smoke-test the backend with:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/wallet/balance/0x0000000000000000000000000000000000000000
curl http://localhost:3001/api/wallet/history/0x0000000000000000000000000000000000000000
curl http://localhost:3001/api/market/prices
curl -X POST http://localhost:3001/api/assistant -H "Content-Type: application/json" -d "{\"message\":\"What's my ETH price?\"}"
```

### Troubleshooting

- If the dashboard cannot connect, start the backend on port `3001` and the frontend on port `3000`.
- If wallet balances fail, verify `ALCHEMY_RPC_URL` and that the configured RPC supports the selected chain.
- If history is unavailable, configure a valid Alchemy URL; the existing history API can otherwise return an empty transfer list.
- If the response says Gemini is unavailable, verify `GEMINI_API_KEY` and `GEMINI_MODEL` in `backend/.env`. The assistant still returns available data-based answers without the key.
- If market data is unavailable, CoinGecko may be unreachable or rate-limited; the assistant will not substitute a guessed price.

---

## ⚠️ Technical Limitations & Academic Notice

**IMPORTANT:** This system is a **Research-Grade Autonomous Prototype** developed as part of a Final Year Project for Rathinam College of Arts and Science | Bharathiar University. 

### Core Limitations
- **Burner Wallet Risk:** The system uses a "Burner Wallet" pattern. The private key resides on the backend server. **Do NOT use with significant real assets.**
- **Centralized Dependencies:** Real-time information relies on external APIs (Gemini, CoinGecko, Alchemy). Failure of these services will degrade system functionality.
- **Single-User Architecture:** This prototype currently lacks a robust multi-user authentication layer.
- **Asynchronous Confirmation:** Transaction confirmation is handled asynchronously; real-time block-status polling is out of scope for this version.

### Future Work
- Implementation of MPC (Multi-Party Computation) for secure key management.
- Integration of local Lightweight LLMs to remove external API dependency.
- On-chain intent verification via smart contract event logs.

---

## 📄 Publication & Citation

This research and project have been officially published on **Zenodo**. If you use this work in your research, please cite it accordingly.

- **Zenodo DOI:** [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.placeholder.svg)](https://doi.org/10.5281/zenodo.placeholder)
- **Paper Title:** *Vetrix: An Autonomous Web3 Agent for Natural Language Transaction Execution*

---

<p align="center">Made with ❤️ for the Web3 Ecosystem</p>
