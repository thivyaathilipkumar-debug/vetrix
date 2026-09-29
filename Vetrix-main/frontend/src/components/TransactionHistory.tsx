'use client';

import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';

const TransactionHistory: React.FC = () => {
  const { history, loading } = useWallet();
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading && history.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-16)', marginTop: 'var(--s-24)' }}>
      <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
        Wallet Activity
      </h4>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '48px' }} />)}
    </div>
  );

  return (
    <div style={{ marginTop: 'var(--s-24)' }}>
      <h4 style={{ 
        fontSize: '11px', 
        fontWeight: 700, 
        textTransform: 'uppercase', 
        color: 'var(--text-muted)', 
        marginBottom: 'var(--s-16)',
        letterSpacing: '0.05em'
      }}>
        Wallet Activity
      </h4>
      
      {history.length === 0 ? (
        <div style={{
          padding: 'var(--s-32)',
          textAlign: 'center',
          border: '1px solid var(--border-neutral)',
          borderRadius: '12px',
          background: 'var(--bg-black)',
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
            No recent activity found.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-neutral)' }}>
          {[...history]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, isExpanded ? history.length : 4)
            .map((tx, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              padding: 'var(--s-12) 0',
              borderBottom: '1px solid var(--border-neutral)',
            }}>
              {/* Type (Left Aligned) */}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: tx.category === 'external' ? 'var(--accent-red)' : 'var(--accent-green)', letterSpacing: '0.02em' }}>
                  {tx.category === 'external' ? 'SEND' : 'RECEIVE'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {tx.contactName && (
                    <span style={{ color: 'var(--text-primary)' }}>{tx.contactName}</span>
                  )}
                  {tx.contactName && <span style={{ opacity: 0.5 }}>→</span>}
                  <span style={{ fontFamily: 'monospace' }}>
                    {(tx.category === 'external' ? tx.to : tx.from).slice(0, 6)}...{(tx.category === 'external' ? tx.to : tx.from).slice(-4)}
                  </span>
                </div>
              </div>

              {/* Amount (Right Aligned) */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  color: tx.category === 'external' ? 'var(--accent-red)' : 'var(--accent-green)' 
                }}>
                  {tx.category === 'external' ? '-' : '+'}{parseFloat(tx.value).toFixed(4)} {tx.asset}
                </div>
                <div style={{ fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>
                  {new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {history.length > 4 && (
            <div style={{
              textAlign: 'center',
              padding: '12px 0 0 0',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
            onClick={() => setIsExpanded(!isExpanded)}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {isExpanded ? 'See less' : 'See more'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
