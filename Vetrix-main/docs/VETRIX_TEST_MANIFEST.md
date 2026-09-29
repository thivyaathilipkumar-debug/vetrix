# 📋 Vetrix V2.4 — Feature Testing Manifest

Use this guide to test every component of the Vetrix Autonomous Agent for your demo.

## 1. 🧠 Context Intelligence (The Brain)
- [ ] **Identity Resolution:** Type `"Send 0.001 ETH to John"` (or any name in your contact book). Verify it resolves to a `0x...` address.
- [ ] **Fiat Integration:** Type `"Send $1 of ETH"`. Verify it calculates the correct ETH amount using CoinGecko live prices.
- [ ] **Relative Amounts:** Type `"Send half of my ETH"`. Verify it triggers the balance-check resolution flow.

## 2. 🛡️ Decision Engine (The Guard)
- [ ] **Safety Capping:** Try to send `0.5 ETH`. Verify the **Decision Engine** rejects it for exceeding the demo limit (0.1 ETH).
- [ ] **Gas Protection:** Try to send nearly your entire balance. Verify it rejects to protect gas reserves.
- [ ] **Pre-flight Summary:** Complete a valid transfer request. Verify the bot pauses and shows a **Safety Summary** ($USD value, Gas, Warning) before execution.

## 3. 🔄 Memory & Recovery (The Safety Net)
- [ ] **Transaction Recall:** After a successful transfer, type `"Repeat"` or `"Same as last time"`. Verify it pre-fills the session with previous data.
- [ ] **Error Forgiveness:** Type `"Send to Rahul"` (assuming Rahul is NOT a contact). Verify the bot suggests adding them and prompts for an address.
- [ ] **Interactive Save:** Provide an address after the "Suggest Add" prompt. Verify it saves the contact and continues the transaction.

## 4. 🎨 Neural Interface (The "Wow" Factor)
- [ ] **Cognitive Stages:** Watch the loading indicator during a request. Verify it cycles through: `Analyzing` → `Resolving` → `Verifying` → `Executing`.
- [ ] **Intelligence Badges:** Look at an assistant message. Verify the presence of **"Verified by Decision Engine"** and **"Safety: XX%"** badges.
- [ ] **Live Lifecycle:** Send a transaction and watch the chat bubble. Verify the badge changes from `⏳ Broadcasting` to `✅ Confirmed` automatically upon block inclusion.

## 5. 📊 Portfolio & Balance
- [ ] **Real-time Sync:** Check your balance using `"What is my balance?"`. Compare it with the sidebar data.
- [ ] **Multi-Asset Support:** Verify that USDC/USDT/DAI are listed (even if 0.00).

---
**Recommended Demo Flow:**
1. "Hi" (Greeting)
2. "Who is John?" (Identity check)
3. "Send $1 to John" (Intelligence + Pre-flight)
4. "Yes" (Confirmation + Execution)
5. Watch the Live Lifecycle badge turn Green.
