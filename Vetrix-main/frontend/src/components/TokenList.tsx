'use client';

import React from 'react';
import { useWallet } from '../context/WalletContext';

interface TokenData {
  asset: string;
  amount: string;
  isNative: boolean;
  contractAddress?: string;
}

interface TokenListProps {
  tokens: TokenData[];
  loading: boolean;
}

const TokenList: React.FC<TokenListProps> = ({ tokens, loading }) => {
  const { prices } = useWallet();
  
  const activeTokens = tokens.filter(t => parseFloat(t.amount) > 0);
  const hasAssets = activeTokens.length > 0;

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
        Assets
      </h4>
      
      {!loading && !hasAssets ? (
        <div style={{
          padding: 'var(--s-32)',
          textAlign: 'center',
          border: '1px solid var(--border-neutral)',
          borderRadius: '12px',
          background: 'var(--bg-black)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--s-20)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
              No assets found
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Receive funds to activate your wallet
            </p>
          </div>
          
          <button style={{
            padding: '8px 16px',
            background: 'var(--accent-green)',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-green-h)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-green)'}
          >
            Receive Funds
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border-neutral)' }}>
          {loading && activeTokens.length === 0 ? (
            [1, 2].map(i => (
              <div key={i} style={{ padding: 'var(--s-16) 0', borderBottom: '1px solid var(--border-neutral)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: '80px', height: '16px' }} />
                <div className="skeleton" style={{ width: '60px', height: '16px' }} />
              </div>
            ))
          ) : (
            activeTokens.map((token) => {
              const price = prices[token.asset.toUpperCase()] || (token.asset === 'USDC' || token.asset === 'USDT' || token.asset === 'DAI' ? 1 : 0);
              const amountNum = parseFloat(token.amount);
              const usdValue = amountNum * price;

              return (
                <div key={token.asset} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--s-16) 0',
                  borderBottom: '1px solid var(--border-neutral)',
                }}>
                  {/* Name (Left Aligned) */}
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {token.asset}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Sepolia Network
                    </div>
                  </div>

                  {/* Value (Right Aligned) */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {amountNum.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default TokenList;
