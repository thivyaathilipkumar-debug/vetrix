'use client';

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import ChatPanel from '@/components/ChatPanel';
import FinancialAssistant from '@/components/FinancialAssistant';
import TokenList from '@/components/TokenList';
import TransactionHistory from '@/components/TransactionHistory';
import ActionModal from '@/components/ActionModal';

const NETWORK_NAMES: Record<string, string> = {
  '11155111': 'Sepolia',
  '1': 'Ethereum',
};

export default function WalletHub() {
  const { balances, loading, address, disconnect, connect, isConnected, chainId, prices, history } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'send' | 'swap' | 'receive'>('send');
  const [assistantMode, setAssistantMode] = useState<'agent' | 'financial'>('agent');

  const ethBalance = balances.find(b => b.isNative);
  const ethAmount = parseFloat(ethBalance?.amount ?? '0');
  const totalUsd = balances.reduce((acc, b) => {
    const p = prices[b.asset] ?? (b.asset === 'USDC' || b.asset === 'USDT' || b.asset === 'DAI' ? 1 : 0);
    return acc + parseFloat(b.amount) * p;
  }, 0);

  const networkName = chainId ? (NETWORK_NAMES[chainId] ?? 'Unknown') : 'Disconnected';
  const lastTx = history[0] ?? null;

  const openModal = (tab: 'send' | 'swap' | 'receive') => {
    setModalTab(tab);
    setModalOpen(true);
  };

  return (
    <div className="bg-dot-grid" style={{
      minHeight: '100vh',
      background: 'var(--bg-black)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Top Bar */}
      <header style={{
        padding: '0 32px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-neutral)',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '8px',
            background: 'var(--accent-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 900, color: '#000',
          }}>N</div>
          <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.02em' }}>Vetrix</span>
          <span style={{
            fontSize: '10px', fontWeight: 700, color: 'var(--accent-green)',
            background: 'rgba(34,197,94,0.1)', padding: '2px 8px',
            borderRadius: '100px', border: '1px solid rgba(34,197,94,0.2)',
            letterSpacing: '0.05em',
          }}>v3.0</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '100px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-neutral)',
            fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isConnected ? 'var(--accent-green)' : 'var(--accent-red)',
              boxShadow: isConnected ? '0 0 6px var(--accent-green)' : 'none',
              display: 'inline-block',
            }} />
            {networkName} Network
          </div>

          {address && (
            <div style={{
              padding: '5px 12px', borderRadius: '100px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-neutral)',
              fontSize: '11px', fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--text-primary)',
            }}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}

          {isConnected ? (
            <button onClick={disconnect} style={{
              padding: '5px 14px', borderRadius: '100px',
              background: 'transparent',
              border: '1px solid rgba(239,68,68,0.3)',
              color: 'var(--accent-red)',
              fontSize: '11px', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Disconnect
            </button>
          ) : (
            <button onClick={connect} style={{
              padding: '5px 14px', borderRadius: '100px',
              background: 'var(--accent-green)',
              border: 'none',
              color: '#000',
              fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-main-grid" style={{
        flex: 1,
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gap: '20px',
        padding: '24px 32px',
        overflow: 'hidden',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>

        {/* Row 1: Three info cards */}
        <div className="dashboard-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

          {/* Balance Card */}
          <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 12px' }}>
              Portfolio Balance
            </p>
            {loading && balances.length === 0 ? (
              <>
                <div className="skeleton" style={{ width: '180px', height: '40px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '100px', height: '16px' }} />
              </>
            ) : (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-2px', color: 'var(--text-primary)' }}>
                    {ethAmount.toFixed(4)}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-green)' }}>ETH</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
                  ≈ ${totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              </div>
            )}
            <div style={{
              marginTop: '20px', paddingTop: '16px',
              borderTop: '1px solid var(--border-neutral)',
              display: 'flex', flexDirection: 'column', gap: '4px',
            }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                Last Activity
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: lastTx ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {lastTx
                  ? `${lastTx.category === 'external' ? 'Sent' : 'Received'} ${parseFloat(lastTx.value).toFixed(4)} ${lastTx.asset}`
                  : 'No recent activity'}
              </span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 20px' }}>
              Quick Actions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {([
                { label: 'Send', tab: 'send', icon: '↗', desc: 'Transfer to any address' },
                { label: 'Swap', tab: 'swap', icon: '⇄', desc: 'Exchange tokens' },
                { label: 'Receive', tab: 'receive', icon: '↙', desc: 'Show your QR code' },
              ] as const).map(({ label, tab, icon, desc }) => (
                <button key={tab} onClick={() => openModal(tab)} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-neutral)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  textAlign: 'left', width: '100%',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(34,197,94,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'var(--border-neutral)';
                }}
                >
                  <span style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: 'rgba(34,197,94,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                  }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Assets Card */}
          <div className="glass-panel" style={{ borderRadius: '20px', padding: '24px', overflow: 'hidden' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0 0 4px' }}>
              Assets
            </p>
            <div className="scrollbar-hidden" style={{ overflowY: 'auto', maxHeight: '200px' }}>
              <TokenList tokens={balances} loading={loading} />
            </div>
          </div>
        </div>

        {/* Row 2: Chat + Activity */}
        <div className="dashboard-chat-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: '16px',
          minHeight: 0,
        }}>

          {/* AI Chat Card */}
          <div className="glass-panel" style={{
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-neutral)',
              display: 'flex', alignItems: 'center', gap: '10px',
              flexShrink: 0,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '10px',
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px',
              }}>🤖</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {assistantMode === 'financial' ? 'AI Financial Assistant' : 'Vetrix AI Agent'}
                  </div>
                <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>
                    {assistantMode === 'financial' ? (isConnected ? '● Wallet connected' : '○ Connect wallet for account data') : (isConnected ? '● Active' : '○ Standby')}
                </div>
              </div>
                <div role="group" aria-label="Assistant mode" style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {([
                    { id: 'agent', label: 'Agent' },
                    { id: 'financial', label: 'Financial' },
                  ] as const).map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={assistantMode === id}
                      onClick={() => setAssistantMode(id)}
                      style={{
                        padding: '6px 9px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-neutral)',
                        background: assistantMode === id ? 'rgba(34,197,94,0.12)' : 'transparent',
                        color: assistantMode === id ? 'var(--accent-green)' : 'var(--text-muted)',
                        fontSize: '10px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {assistantMode === 'financial' ? <FinancialAssistant /> : <ChatPanel />}
            </div>
          </div>

          {/* Activity Card */}
          <div className="glass-panel" style={{
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-neutral)',
              flexShrink: 0,
            }}>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
                Recent Activity
              </p>
            </div>
            <div className="scrollbar-hidden" style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
              <TransactionHistory />
            </div>
          </div>

        </div>
      </div>

      <ActionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} initialTab={modalTab} />
    </div>
  );
}
