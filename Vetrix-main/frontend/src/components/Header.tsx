'use client';

import React, { useState, useCallback } from 'react';
import ActionModal from './ActionModal';

interface HeaderProps {
  address: string | null;
  chainId: string | null;
  onDisconnect?: () => void;
}

const NETWORK_NAMES: Record<string, string> = {
  '11155111': 'Sepolia',
  '1':        'Ethereum',
};

const Header: React.FC<HeaderProps> = ({ address, chainId, onDisconnect }) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'send'|'swap'|'receive'>('send');

  const networkName = chainId ? (NETWORK_NAMES[chainId] ?? 'Unknown') : 'Disconnected';

  const handleCopyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* disabled */ }
  }, [address]);

  const openAction = (tab: 'send'|'swap'|'receive') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <>
      <header style={{
        height: '64px',
        padding: '0 var(--s-24)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-neutral)',
        gap: 'var(--s-16)',
      }}>
        {/* Quick Actions - Central Bar */}
        <div style={{ display: 'flex', gap: 'var(--s-8)' }}>
          {address && (
            <>
              <button 
                onClick={() => openAction('send')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-neutral)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
              >
                SEND
              </button>
              <button 
                onClick={() => openAction('swap')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-neutral)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                SWAP
              </button>
              <button 
                onClick={() => openAction('receive')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-neutral)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                RECEIVE
              </button>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-12)' }}>
          {/* Network Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--s-8)',
            background: 'var(--bg-surface)',
            padding: 'var(--s-4) var(--s-12)',
            borderRadius: '8px',
            border: '1px solid var(--border-neutral)',
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: address ? 'var(--accent-green)' : 'var(--accent-red)',
            }} />
            <span className="text-label" style={{ color: 'var(--text-secondary)' }}>
              {networkName}
            </span>
          </div>

          {/* Wallet Summary */}
          {address && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--s-8)',
              background: 'var(--bg-surface)',
              padding: 'var(--s-4) var(--s-4) var(--s-4) var(--s-12)',
              borderRadius: '10px',
              border: '1px solid var(--border-neutral)',
            }}>
              <span className="mono" style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button
                onClick={handleCopyAddress}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  border: 'none',
                  background: copied ? 'rgba(34,197,94,0.1)' : 'transparent',
                  color: copied ? 'var(--accent-green)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {copied ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
              
              <div style={{ width: '1px', height: '16px', background: 'var(--border-neutral)', margin: '0 4px' }} />
              
              <button
                onClick={onDisconnect}
                style={{
                  padding: '0 12px',
                  height: 28,
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--accent-red)',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  opacity: 0.7,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
              >
                DISCONNECT
              </button>
            </div>
          )}
        </div>
      </header>

      <ActionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
      />
    </>
  );
};

export default Header;
