'use client';

import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { useWallet } from '../context/WalletContext';

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What's my wallet balance?",
  'Show my recent transactions',
  "What's my ETH price?",
  'Summarize my portfolio',
];

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/chat')
  .replace(/\/api\/chat\/?$/, '/api')
  .replace(/\/$/, '');

export default function FinancialAssistant() {
  const { address } = useWallet();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ask me about your wallet, transactions, portfolio, or current market prices.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isLoading) return;

    setMessages((current) => [...current, { role: 'user', content: trimmedQuestion }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedQuestion, walletAddress: address }),
      });
      const result = await response.json();
      if (!response.ok || !result.success || typeof result.answer !== 'string') {
        throw new Error(result.error || 'The assistant could not answer right now.');
      }
      setMessages((current) => [...current, { role: 'assistant', content: result.answer }]);
    } catch (error) {
      setMessages((current) => [...current, {
        role: 'error',
        content: error instanceof Error ? error.message : 'Connection error. Check that the Vetrix backend is running.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="scrollbar-hidden" aria-live="polite" style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '20px 20px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
            gap: '4px',
          }}>
            <span style={{
              padding: message.role === 'user' ? '0 8px 0 0' : '0 0 0 8px',
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase',
              opacity: 0.45,
            }}>
              {message.role === 'user' ? 'You' : message.role === 'error' ? 'Error' : 'Vetrix AI'}
            </span>
            <div style={{
              maxWidth: '88%',
              padding: '10px 14px',
              borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: message.role === 'user' ? 'var(--bg-surface)' : message.role === 'error' ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${message.role === 'error' ? 'rgba(239,68,68,0.2)' : 'var(--border-neutral)'}`,
              color: message.role === 'error' ? 'var(--accent-red)' : message.role === 'user' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}>
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div role="status" aria-label="Assistant is responding" style={{ padding: '4px 8px', display: 'flex', gap: '4px' }}>
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '8px 20px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {SUGGESTED_QUESTIONS.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => void sendMessage(question)}
            disabled={isLoading}
            style={{
              padding: '5px 12px',
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-neutral)',
              color: 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: isLoading ? 'default' : 'pointer',
              opacity: isLoading ? 0.55 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {question}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0 20px 20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255,255,255,0.02)',
          padding: '4px 6px 4px 16px',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <input
            type="text"
            aria-label="Ask the AI Financial Assistant"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={1000}
            placeholder="Ask about your finances..."
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              padding: '10px 0',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: input.trim() ? 'var(--text-primary)' : 'transparent',
              border: 'none',
              color: '#000',
              fontSize: '11px',
              fontWeight: 800,
              cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              opacity: input.trim() && !isLoading ? 1 : 0.45,
            }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}