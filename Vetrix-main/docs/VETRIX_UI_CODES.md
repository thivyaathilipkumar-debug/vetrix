# 🖥️ Vetrix V3.0 — Frontend UI Source Codes

Here are the updated, core React components for the frontend interface. You can use these snippets as reference material for your manuscript's UI/UX or implementation sections.

---

## 1. Main Chat Page Layout (`src/app/chat/page.tsx`)
This file handles the global layout, the responsive sidebar, wallet connection state, and the continuous polling of the user's real-time portfolio balances from the Alchemy RPC.

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useWallet } from '../../context/WalletContext';
import ChatInterface from '../../components/ChatInterface';
import NeuralStatus from '../../components/NeuralStatus';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/chat').replace('/api/chat', '');

export default function ChatPage() {
  const { address, chainId, isConnected, connect, disconnect } = useWallet();
  const [balances, setBalances] = useState([]);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch portfolio balances every 30s
  useEffect(() => {
    if (!address) return setBalances([]);

    const fetchBalances = async () => {
      setBalancesLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/portfolio/${address}?chain=sepolia`);
        if (res.data.balances) setBalances(res.data.balances);
      } catch (error) {
        console.error('Balance fetch error:', error);
      } finally {
        setBalancesLoading(false);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [address]);

  return (
    <div className="h-screen flex" style={{ background: '#0a0a1a' }}>
      {/* Sidebar Navigation */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="w-72 flex-shrink-0 flex flex-col border-r border-white/5 h-screen"
        style={{ background: 'linear-gradient(180deg, #0f0f23 0%, #0a0a1a 100%)' }}
      >
        {/* Logo and Status */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
              A
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Vetrix</h1>
              <p className="text-[10px] text-purple-400 font-bold uppercase">Research Prototype V2.2</p>
            </div>
          </div>
        </div>

        {/* ... (Wallet Info and Portfolio rendered here) */}

      </motion.aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <NeuralStatus />
        <ChatInterface />
      </main>
    </div>
  );
}
```

---

## 2. The Chat & Conversation Engine (`src/components/ChatInterface.tsx`)
This is the most critical UI component. It manages the conversational state array, the simulated AI "Thinking" stages, the Pre-Flight Confirmation buttons (`Confirm` / `Cancel`), and the real-time Transaction Lifecycle Badging (watching the Hash confirm on-chain).

```tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useWallet } from '../context/WalletContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/chat';

const ChatInterface: React.FC = () => {
  const { address, isConnected, provider } = useWallet();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm Vetrix V2, your autonomous AI Web3 agent. I can send tokens, check balances, and explain blockchain concepts. Just tell me what you need — no MetaMask popups, I handle everything! 🤖",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  
  // Simulated Thought Process steps
  const loadingStages = [
    "🧠 Analyzing Intent...",
    "👤 Resolving Context...",
    "🛡️ Verifying Safety...",
    "⛓️ Executing Transaction..."
  ];

  // ── V2.4: LIVE TRANSACTION LIFECYCLE MONITOR ──
  useEffect(() => {
    const pendingMsgs = messages.filter(m => m.role === 'assistant' && m.status === 'pending' && m.txHash);
    
    pendingMsgs.forEach(async (msg) => {
      if (!msg.txHash || !provider) return;
      try {
        const receipt = await provider.waitForTransaction(msg.txHash);
        if (receipt) {
          setMessages(prev => prev.map(m => 
            m.id === msg.id ? { ...m, status: 'success' } : m
          ));
        }
      } catch (err) {
        console.error(`Confirmation failed:`, err);
      }
    });
  }, [messages, provider]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    // ... add user message to state
    setIsLoading(true);

    try {
      const response = await axios.post(API_BASE_URL, {
        message: userMessage,
        session_id: sessionId,
        wallet_address: address,
      });

      const data = response.data;

      // ── Handle execution / confirmation / gap-filling based on backend response ──
      if (data.next_step === 'done') {
        addMessage('assistant', data.message, data.data, data.txHash, data.explorer, 'pending');
      } else if (data.next_step === 'ask_user' && data.data?.needs_confirmation) {
        // Triggers the Saftey Approval Modal
        addMessage('assistant', data.message, data.data);
      } else {
        addMessage('assistant', data.message, data.data || null);
      }
    } catch (error) {
      // Handle network errors
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #111128 100%)' }}>
      
      {/* Messages Render Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div key={msg.id} className={`flex w-full mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white/5">
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                {/* Pre-Flight Confirmation Buttons (Rendered only if intent requires consent) */}
                {msg.intentData?.needs_confirmation && msg.role === 'assistant' && (
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setInput('Yes')} className="px-3 py-1.5 bg-green-500/20 text-green-400">
                      Confirm
                    </button>
                    <button onClick={() => setInput('No')} className="px-3 py-1.5 bg-red-500/20 text-red-400">
                      Cancel
                    </button>
                  </div>
                )}
                
                {/* Live Transaction Badge Status */}
                {msg.txHash && (
                  <div className="mt-3 pt-2 border-t border-white/10">
                    {msg.status === 'pending' ? (
                       <span className="text-blue-400">⏳ Broadcasting to Sepolia...</span>
                    ) : (
                       <span className="text-green-400">✅ Confirmed On-Chain</span>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Field */}
      {/* ... */}
    </div>
  );
};
export default ChatInterface;
```
