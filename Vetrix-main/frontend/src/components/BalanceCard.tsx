'use client';

import React from 'react';
import { useWallet } from '../context/WalletContext';

interface BalanceCardProps {
  balances: Array<{ asset: string; amount: string; isNative: boolean }>;
  loading: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balances, loading }) => {
  const { prices, history } = useWallet();
  const ethBalance = balances.find(b => b.isNative);
  const ethAmount = ethBalance?.amount ?? '0.000000';
  
  const totalUsdValue = balances.reduce((acc, curr) => {
    const price = prices[curr.asset] || (curr.asset === 'USDC' || curr.asset === 'USDT' || curr.asset === 'DAI' ? 1 : 0);
    return acc + (parseFloat(curr.amount) * price);
  }, 0);

  const lastTx = history.length > 0 ? history[0] : null;

  return (
    <div style={{ padding: 'var(--s-32) 0', textAlign: 'left' }}>
      {/* Portfolio Header Block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-8)' }}>
        <p style={{ 
          fontSize: '11px', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
          margin: 0
        }}>
          Portfolio Balance
        </p>
        
        {loading && balances.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-12)' }}>
            <div className="skeleton" style={{ width: '280px', height: '48px' }} />
            <div className="skeleton" style={{ width: '140px', height: '20px' }} />
          </div>
        ) : (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-12)' }}>
              <h2 style={{
                fontSize: '36px',
                fontWeight: 600,
                lineHeight: 1,
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}>
                {parseFloat(ethAmount).toFixed(4)}
              </h2>
              <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--accent-green)',
                letterSpacing: '-0.02em',
              }}>
                ETH
              </span>
            </div>
            
            <p style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              margin: 0,
            }}>
              ≈ ${totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </p>
          </div>
        )}
      </div>

      {/* Metadata Inline Row (Part of Part 1 Fix) */}
      <div style={{ 
        marginTop: 'var(--s-24)', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--s-24)',
        borderTop: '1px solid var(--border-neutral)',
        paddingTop: 'var(--s-16)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-8)' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Activity:</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: lastTx ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {lastTx ? `${lastTx.category.toUpperCase()} ${parseFloat(lastTx.value).toFixed(2)} ${lastTx.asset}` : 'None'}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-8)' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Identity:</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-green)' }}>Verified • Sepolia</span>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
