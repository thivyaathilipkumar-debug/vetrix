'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useWallet } from '../context/WalletContext';
import TransactionCard from './TransactionCard';
import TxProcessingLoader from './TxProcessingLoader';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  data?: any;
}

// Simple inline markdown renderer — handles **bold** and newlines
function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    // Handle newlines
    return part.split('\n').map((line, j, arr) => (
      <React.Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  });
}

interface ChatPanelProps {
  lastTx?: { category: string; value: string; asset: string } | null;
  ethAmount?: number;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ lastTx, ethAmount = 0 }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! I'm Vetrix. Tell me what you want to do — send, swap, check your balance, anything. I'll handle the blockchain part." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { address } = useWallet();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Smart suggestions derived from real wallet state
  const suggestions = useMemo(() => {
    const s: string[] = [];
    if (ethAmount > 0) s.push(`Send ${(ethAmount * 0.1).toFixed(4)} ETH`);
    else s.push('Send ETH to a friend');
    s.push(lastTx ? 'Repeat my last transaction' : "What's my balance?");
    s.push('How much will gas cost?');
    return s;
  }, [lastTx, ethAmount]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    // If the user's msg is an affirmative response to a confirmation, show the tx loader
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.data && lastMsg.data.needs_confirmation) {
      if (['yes', 'confirm', 'do it', 'yup', 'ok', 'go ahead'].includes(input.toLowerCase().trim())) {
        setIsProcessingTx(true);
      }
    }
    
    try {
      const resp = await axios.post('http://localhost:3001/api/chat', {
        message: input,
        session_id: sessionId,
        wallet_address: address,
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: resp.data.message,
        data: resp.data.data,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Connection error. Please check your network and try again.',
      }]);
    } finally {
      setIsLoading(false);
      setIsProcessingTx(false);
    }
  };

  const handleActionSend = async (actionText: string) => {
    if (isLoading) return;
    const userMsg: Message = { role: 'user', content: actionText };
    setMessages(prev => {
      const newMessages = prev.map(m => m.data ? { ...m, data: { ...m.data, needs_confirmation: false } } : m);
      return [...newMessages, userMsg];
    });
    setIsLoading(true);
    if (actionText === 'Confirm') setIsProcessingTx(true);
    
    try {
      const resp = await axios.post('http://localhost:3001/api/chat', {
        message: actionText.toLowerCase(),
        session_id: sessionId,
        wallet_address: address,
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: resp.data.message,
        data: resp.data.data,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Connection error. Please check your network and try again.',
      }]);
    } finally {
      setIsLoading(false);
      setIsProcessingTx(false);
    }
  };

  // Called by TransactionCard when tx is confirmed — injects result into chat
  const handleTxConfirmed = (summary: string) => {
    setMessages(prev => [...prev, { role: 'assistant', content: summary }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Message stream */}
      <div className="scrollbar-hidden" style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 20px 8px',
        display: 'flex', flexDirection: 'column', gap: '20px',
      }}>
        {messages.map((msg, i) => (
          <div key={i} className="animate-fade-in" style={{
            display: 'flex', flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: '4px',
          }}>
            <span style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', opacity: 0.35,
              paddingLeft: msg.role !== 'user' ? '8px' : 0,
              paddingRight: msg.role === 'user' ? '8px' : 0,
            }}>
              {msg.role === 'user' ? 'You' : 'Vetrix'}
            </span>

            <div style={{
              maxWidth: '88%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user'
                ? 'var(--bg-surface)'
                : msg.role === 'system'
                ? 'rgba(239,68,68,0.06)'
                : 'rgba(255,255,255,0.02)',
              border: msg.role === 'system'
                ? '1px solid rgba(239,68,68,0.15)'
                : '1px solid var(--border-neutral)',
              color: msg.role === 'user'
                ? 'var(--text-primary)'
                : msg.role === 'system'
                ? 'var(--accent-red)'
                : 'var(--text-secondary)',
              fontSize: '13px', fontWeight: 500, lineHeight: 1.55,
              wordBreak: 'break-word',
            }}>
              {renderMarkdown(msg.content)}
              {msg.data && msg.data.needs_confirmation && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button
                    onClick={() => handleActionSend('Confirm')}
                    disabled={isLoading}
                    style={{
                      padding: '8px 18px', borderRadius: '100px',
                      background: 'var(--accent-green)',
                      border: 'none', color: '#000',
                      fontSize: '12px', fontWeight: 700,
                      cursor: isLoading ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleActionSend('Cancel')}
                    disabled={isLoading}
                    style={{
                      padding: '8px 18px', borderRadius: '100px',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--text-muted)',
                      fontSize: '12px', fontWeight: 700,
                      cursor: isLoading ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ padding: '4px 8px' }}>
            {isProcessingTx ? (
              <TxProcessingLoader />
            ) : (
              <div className="animate-fade-in" style={{ display: 'flex', gap: '4px' }}>
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Smart suggestions */}
      <div style={{
        padding: '8px 20px',
        display: 'flex', flexWrap: 'wrap', gap: '6px',
      }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => setInput(s)} style={{
            padding: '5px 12px', borderRadius: '100px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-neutral)',
            color: 'var(--text-muted)',
            fontSize: '11px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--accent-green)';
            e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)';
            e.currentTarget.style.background = 'rgba(34,197,94,0.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border-neutral)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(255,255,255,0.02)',
          padding: '4px 6px 4px 16px',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.06)',
          transition: 'border-color 0.15s',
        }}
        onFocus={() => {}}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Vetrix anything..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: 'var(--text-primary)', fontSize: '13px',
              fontWeight: 500, padding: '10px 0', outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              padding: '8px 16px', borderRadius: '10px',
              background: input.trim() ? 'var(--text-primary)' : 'transparent',
              border: 'none', color: '#000',
              fontSize: '11px', fontWeight: 800,
              cursor: input.trim() ? 'pointer' : 'default',
              transition: 'all 0.15s',
              opacity: input.trim() ? 1 : 0,
              pointerEvents: input.trim() ? 'auto' : 'none',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
