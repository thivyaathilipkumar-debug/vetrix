# Nexus Autonomous Agent: Viva Presentation Guide & Features

This document is designed to help you quickly explain your project's features and backend workflows to your examiners during the final FYP Viva presentation.

---

## 1. Feature: Natural Language Intent Parsing
**The Problem:** Traditional Web3 interactions require dealing with hexadecimal addresses, unreadable smart contract data, and volatile gas economics.
**Our Solution:** The user types complex requests in plain English, and the Nexus system translates them into executable blockchain actions.

*   **Workflow:**
    1.  User inputs: *"Send $10 to John"* via the Chat UI.
    2.  The frontend sends the string and `session_id` to the `/api/chat` Express backend.
    3.  The `intentController` routes the raw text through our customized **Gemini 2.0 Flash Model**.
    4.  Gemini uses a strict **Zod Schema (V3.0)** to classify the text into structured JSON metadata identifying the `action` (`send_eth`), `target` (John), and `amount` ($10).

## 2. Feature: Dynamic Fiat-to-Crypto Oracle Conversion
**The Problem:** Users do not typically think in fractions of Ethereum (ETH); they think in Fiat currency (USD/INR).
**Our Solution:** The Agent performs real-time market value derivations to calculate precise cryptographical amounts.

*   **Workflow:**
    1.  The parsed intent identifies an intent amount of `$10 USD`.
    2.  The backend's `amountParser.js` connects securely to the **CoinGecko 5-Minute In-Memory API Cache**.
    3.  It fetches live ETH rates without hallucinating or hitting rate limits.
    4.  The system converts the `$10 USD` strictly into its active `wei` representation for the blockchain transaction logic.

## 3. Feature: The Autonomous Safety & Guardrail Engine
**The Problem:** Giving an AI access to a Web3 wallet is extremely dangerous without strict hard-coded rules.
**Our Solution:** Our `decisionEngine.js` acts as an absolute deterministic referee overriding any dangerous AI outputs.

*   **Workflow:**
    1.  Before ANY action is queued, the parsed intent flows through the **Deterministic Safety Layer**.
    2.  The engine checks the wallet's current balance vs. requested transaction.
    3.  **Rule 1:** It enforces a strictly non-custodial maximum demo cap of **0.1 ETH**. Any requests over this are instantaneously rejected to prevent large theft.
    4.  **Rule 2 - Gas Protection (20% Reserve):** The AI calculates estimated Alchemy Gas fees and restricts interactions if the wallet does not have a 20% safe buffer reserved to prevent stuck/failed transactions.

## 4. Feature: Contact Identity & Error Forgiveness (Recovery Layer)
**The Problem:** Transaction failures due to missing wallet strings cause panic and fear in traditional DeFi.
**Our Solution:** The agent has a contextual identity registry and gracefully forgives errors.

*   **Workflow:**
    1.  User says: *"Send funds to Alice"*.
    2.  The `contactService.js` scans the local memory/ledger. If "Alice" is unknown, the AI does *not* throw a scary failure error.
    3.  Instead, it triggers a **Pivot State (`suggest_add`)** and warmly replies: *"I don't have Alice in my contacts. Would you like to add her?"*
    4.  The workflow is seamlessly paused, the UI updates, and resumes once verified.

## 5. Feature: Persistent Transaction Memory (Contextual Retries)
**The Problem:** If a user performs repetitive micro-transactions, navigating traditional UI flows over and over is exhausting.
**Our Solution:** Nexus remembers session history and can repeat blockchain executions natively via basic statements.

*   **Workflow:**
    1.  User enters: *"Repeat my last transaction."*
    2.  The model parses the intent action as `repeat`.
    3.  The system pulls the most recent broadcasted state from the `session_id` audit logs.
    4.  And duplicates the exact execution path without the user re-explaining parameters.

---

### Tips for Viva Examiners
*   **Emphasize "Cognitive Overload":** Frequently mention that this project wasn't just building a bot, it was actively designing a psychological solution to make DeFi less intimidating.
*   **Highlight Determinism:** Examiners worry that AI hallucinates. Heavily highlight Feature #3 (The Safety Engine) — explain how the LLM parses intent, but deterministic JS code *approves* the execution. The AI never clicks "Send" itself.
