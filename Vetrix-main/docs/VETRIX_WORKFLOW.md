# 🔄 Vetrix V2.1 — 'Human-Native' User Workflow

This document describes the step-by-step lifecycle of a user-initiated autonomous transaction in Version 2.1.

## 🌟 The "Wow" Workflow
The system is designed to handle natural human intent, transforming a vague request like **"Send $5 ETH to John"** into a verified blockchain transaction.

### 1. Intent Capturing (Frontend)
- **User Action:** Types the prompt into the `ChatInterface`.
- **System Action:** Sends the message and the current `session_id` to the backend.

### 2. Contextual Parsing (LLM)
- **Gemini AI:** Parses the message based on the specialized **System Prompt**.
- **Extraction:**
  - `action`: `transfer`
  - `asset`: `ETH`
  - `amount`: `$5` (Smart Amount detected)
  - `to_address`: `John` (Contact Name detected)
- **Validation:** `Zod` forces the Gemini JSON output into a strict schema.

### 3. Context Intelligence Resolution (Backend Layer)
Vetrix now enters its intelligence layer to resolve the human-native fields:
- **Contact Resolver:** Looks up `John` in the `Vetrix_db.json`. Translates to `0x742...`.
- **Amount Parser:** Calls **CoinGecko API** for the current ETH price. Translates `$5` into $5 / 2500$ = `0.002`.
- **Session Merge:** The temporary session memory is updated with the resolved values (`0x742...` and `0.002`).

### 4. Decision & Safety (The Guardrail)
Before execution, the **Decision Engine** performs a multi-factor check:
- **Balance Verification:** Checks if the burner wallet has sufficient funds.
- **Dynamic Limit Check:** Ensures the transaction is within the $min(0.1, 80\%)$ safety threshold.
- **Gas Simulation:** Estimates cost and ensures a 20% gas buffer remains.

### 5. Autonomous Execution (Blockchain)
- **Fast-Broadcast:** The `walletService` signs the transaction and broadcasts it.
- **Immediate Response:** Backend returns `status: 'pending'` and the `txHash` to the UI in **<2 seconds**.
- **Pending UI:** The frontend displays the Blue/Pulse "TX PENDING" badge.

### 6. Audit & Persistence
- **Audit Logging:** The original user prompt ("Send $5 ETH to John") is logged in the `Vetrix_db.json` history linked to the `txHash`.
- **Final Result:** Once the transaction is mined in the background, the UI can be updated to "Confirmed."
