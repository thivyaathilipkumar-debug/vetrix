'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'send' | 'swap' | 'receive';
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, initialTab = 'send' }) => {
  const { address, balances, refreshBalances, signer, error: walletError } = useWallet();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [asset, setAsset] = useState('ETH');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!signer || !recipient || !amount) return;
    setLocalError(null);
    setIsLoading(true);

    try {
      // Basic validation
      if (!ethers.isAddress(recipient)) {
        throw new Error('Invalid recipient address');
      }

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });

      setTxHash(tx.hash);
      await tx.wait();
      await refreshBalances();
      // Optional: auto-close after success 
    } catch (err: any) {
      setLocalError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      padding: 'var(--s-24)',
    }}>
      <div className="fintech-card" style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--bg-black)',
        padding: '0',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
      }}>
        {/* Header Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-neutral)',
        }}>
          {['send', 'swap', 'receive'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab as any); setTxHash(null); setLocalError(null); }}
              style={{
                flex: 1,
                padding: 'var(--s-16)',
                background: activeTab === tab ? 'var(--bg-surface)' : 'transparent',
                border: 'none',
                color: activeTab === tab ? 'var(--accent-green)' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab}
            </button>
          ))}
          <button onClick={onClose} style={{ padding: 'var(--s-16)', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: 'var(--s-24)' }}>
          {activeTab === 'send' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-16)' }}>
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: 'var(--s-8)' }}>Asset</label>
                <select 
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-neutral)',
                    color: '#fff',
                    outline: 'none'
                  }}
                >
                  {balances.map(b => <option key={b.asset} value={b.asset}>{b.asset} (Balance: {parseFloat(b.amount).toFixed(4)})</option>)}
                </select>
              </div>

              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: 'var(--s-8)' }}>Recipient Address</label>
                <input 
                  type="text" 
                  placeholder="0x..." 
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-neutral)',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: 'var(--s-8)' }}>Amount</label>
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-neutral)',
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              {localError && <p style={{ color: 'var(--accent-red)', fontSize: '12px', textAlign: 'center' }}>{localError}</p>}
              {txHash && <p style={{ color: 'var(--accent-green)', fontSize: '11px', textAlign: 'center' }}>Success! Hash: {txHash.slice(0,10)}...</p>}

              <button
                disabled={isLoading || !amount || !recipient}
                onClick={handleSend}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'var(--accent-green)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: isLoading ? 'wait' : 'pointer',
                  marginTop: 'var(--s-8)',
                  opacity: (isLoading || !amount || !recipient) ? 0.5 : 1,
                }}
              >
                {isLoading ? 'SIGNING...' : 'CONFIRM SEND'}
              </button>
            </div>
          )}

          {activeTab === 'receive' && (
            <div style={{ textAlign: 'center', padding: 'var(--s-16) 0' }}>
              <p className="text-label" style={{ marginBottom: 'var(--s-16)' }}>Your Wallet Address</p>
              <div style={{
                background: 'var(--bg-surface)',
                padding: 'var(--s-16)',
                borderRadius: '12px',
                border: '1px solid var(--border-neutral)',
                marginBottom: 'var(--s-24)',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '14px',
                color: 'var(--accent-green)',
              }}>
                {address}
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(address || ''); }}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                COPY ADDRESS
              </button>
            </div>
          )}

          {activeTab === 'swap' && (
            <div style={{ textAlign: 'center', padding: 'var(--s-32) 0' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Swap engine is currently in simulation mode.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: 'var(--s-8)' }}>Sepolia AMM Pool integration coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
