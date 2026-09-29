# 📝 Vetrix V3.0 — Handover & UI Blueprint

This document is for the next developer/teammate taking over the Vetrix project. It explains the high-level architecture, UI design decisions, and future roadmap.

## 1. 🧠 Theoretical Architecture (The Intelligence Layer)
Vetrix is an **Autonomous Web3 Agent**. It differs from regular dApps because it handles blockchain operations on the server side (Burner Wallet) to reduce user friction.

- **Intent Pipeline:** `User Prompt` ➝ `Gemini LLM` ➝ `Zod Validation` ➝ `Decision Engine` ➝ `Blockchain`.
- **The Context Stack:** We have four specialized services to handle natural language ambiguity:
    - `contactService`: Resolves "John" to `0x...` using `Vetrix_db.json`.
    - `amountParser`: Resolves "$10" to ETH using CoinGecko live prices.
    - `memoryService`: Resolves "Repeat last" by checking the audit log.
    - `decisionEngine`: The safety guard that enforces the 0.1 ETH cap before execution.

## 2. 🎨 UI/UX Design Blueprint (The Neural Interface)
The UI is designed to be "minimalist yet premium," focusing on the AI's compute lifecycle.

- **Neural Loading Stages:** Instead of a generic spinner, we show stages: `Analyzing` → `Resolving` → `Verifying` → `Executing`. This builds trust by showing the AI is "thinking."
- **Live Lifecycle Badges:** (V2.4 Upgrade) The transaction badge in the chat bubble pulses blue when broadcasting and turns green automatically when the block is confirmed.
- **Trust Layer (Pre-flight):** Before any execution, the bot pauses and asks for confirmation via a **Safety Summary** ($USD value, Gas, and an Irreversibility warning).

## 3. 🛠️ Future UI Roadmap (For the successor)
- **Voice Mode:** Implementation of Web Speech API for hands-free transaction initiation.
- **Visual Analytics:** Add a "Neural Graph" showing the confidence level of the intent parsing in real-time.
- **Mobile Hardening:** The `ChatInterface` needs better flex-wrap for smaller screens (specifically the confirmation buttons).

## 4. 🚀 Operational Guide
- **Env Vars:** You must have `BOT_PRIVATE_KEY` with Sepolia ETH for the bot to pay gas.
- **Database:** `Vetrix_db.json` is a simple persistent store. Do not delete it if you want to keep contacts/history.
- **Testing:** Always refer to `TEST_MANIFEST.md` for verified demo flows.
