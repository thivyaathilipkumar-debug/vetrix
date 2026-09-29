# Nexus Web3 Assistant — Frontend

Welcome to the Nexus frontend. This is a production-grade, typography-driven Web3 dashboard built for real-time asset management and AI-guided blockchain interactions.

---

## 🚀 Quick Start

### 1. Install Dependencies
Ensure you are using Node 18+ and have `npm` installed.
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create/update `frontend/.env.local` to include your Alchemy RPC URL for the Sepolia network.
```env
NEXT_PUBLIC_ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### 3. Launch Development Server
```bash
npm run dev
```
The dashboard will be available at `http://localhost:3000`.

---

## 🏛️ Project Architecture

- **`src/app`**: Next.js App Router. Contains the main `/chat` (Portfolio) and `/discover` views.
- **`src/context`**: `WalletContext` handles all real-time blockchain polling (12s intervals), balance fetching, and market pricing via the backend.
- **`src/components`**: Disciplined, flat-design UI components using Vanilla CSS and strict institutional alignment rules.
- **`src/hooks`**: Custom Web3 hooks for transaction signing and contract interactions.

---

## 🛠️ Technical Stack

- **Core**: Next.js 14+ (Turbopack).
- **Blockchain**: Viem / Ethers.js for RPC communication.
- **Styling**: Vanilla CSS with a centralized typography and spacing system in `globals.css`.
- **APIs**: Alchemy (Blockchain Data) and CoinGecko (Market Pricing).

---

## 🧩 Team Guidelines

- **Typography First**: Nexus uses a strictly aligned typographic system. All numeric values must be **right-aligned**, and labels must be **left-aligned** (text-xs uppercase neutral-500).
- **Zero Noise**: Avoid adding decorative elements like box-shadows, glows, or inconsistent rounded pills. Nexus is built for institutional clarity.
- **Real Data Only**: No mock data or placeholders are permitted in the main views. Everything must flow through the `WalletContext`.

---

**Nexus: Professional. Structured. Disciplined.**
