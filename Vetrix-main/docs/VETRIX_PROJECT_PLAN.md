# 📚 AI + Web3 — Project Plan V3.0 (Evolution & Completion)

**Project Title:** Vetrix: A Research-Grade Autonomous AI Web3 Agent System  
**Academic Version:** V3.0 (Consolidating V2.1 + V2.2 Evolution)  
**Status:** Implementation Complete / Ready for Viva Submission  

---

## 1. Executive Summary / Abstract
The Vetrix Project is an investigation into the feasibility of **Human-Native Blockchain Interaction**. Moving away from traditional dApp signing models, Vetrix V3.0 introduces a fully autonomous, server-side agentic architecture. By integrating Large Language Models (LLMs) with a sovereign execution environment, the system abstracts the technical complexities (addresses, gas, decimals) into a seamless conversational experience using the **Context Intelligence Layer** and **Decision Engine Stability** patterns.

---

## 2. Project Objectives
1. **Autonomous Execution:** Remove the need for client-side transaction signing (MetaMask popups) via a secure backend burner-wallet model.
2. **Contextual Awareness (V2.1):** Develop a system that resolves natural language identities (contacts) and fiat-expressed values (USD pricing via CoinGecko).
3. **Safety & Stability (V2.2):** Implement a deterministic "Decision Engine" to enforce safety guardrails and prevent unintended asset depletion.
4. **Verifiable Auditability:** Create a persistent off-chain audit trail mapping user intent directly to on-chain transaction hashes.

---

## 3. Methodology & Technical Stack
The system follows a **Modular Agentic Architecture**, separating intent parsing from blockchain execution:
- **Core Intelligence:** Google Gemini 2.0 Flash (Zero-shot NLP parser).
- **Execution Engine:** Node.js / Ethers.js V6 (Provider/Signer singleton).
- **Context Layer:** Edge-Persistence (JSON persistence) for contact resolution and session tracking.
- **Oracle Layer:** CoinGecko Public API for real-time token-to-fiat conversion.
- **Presentation Layer:** Next.js 15+ with Neural Stage Loading and intelligence badges.

---

## 4. Final Phase Evolution (V2.1 - V2.2)

### 🔘 Module A: Context & Memory (V2.1)
- **Identity Resolver:** Implementation of a persistent contact book allowing `"Send to Rahul"` instead of 0x addresses.
- **Dynamic Pricing:** Real-time calculation of token amounts based on USD price oracles.
- **Intent Memory:** Implemented "Transaction Recall" logic to repeat historical actions with a single natural language word (e.g., `"Repeat"`).

### 🔘 Module B: Unbreakable Stability (V2.2)
- **Decision Engine Guardrails:** Programmatic enforcement of safe transfer limits (`max 0.1 ETH`) and gas reserve protection (`20% buffer`).
- **Neural UI interface:** Re-designed the user interaction loop to show the AI’s cognitive lifecycle (Analyzing, Resolving, Verifying, Executing).
- **Failure Recovery:** Implemented demo-fallback modes for API outages, ensuring 0% system crash rates during presentation.

---

## 5. Security & Ethical Considerations
- **Non-Custodial Context:** While the backend signs transactions, the *intent* originates from a confirmed user session.
- **Safety Guardrails:** Manual caps on transaction volume protect the burner wallet from malicious or accidental depletion.
- **Academic Transparency:** The project explicitly documents the risks of centralized dependencies (LLM APIs) and server-side key management.

---

## 6. Conclusion & Future Scope
Vetrix V3.0 proves that blockchain interaction can be human-native without sacrificing autonomous capability. Future iterations will explore **Multi-Party Computation (MPC)** for distributed key security and **local lightweight LLMs** for 100% sovereign air-gapped operations.

---
**Prepared For:** Final Year Project (FYP) Submission  
**Research Lead:** RCAS Bharathiar University Consortium  
**Date:** March 30, 2026
