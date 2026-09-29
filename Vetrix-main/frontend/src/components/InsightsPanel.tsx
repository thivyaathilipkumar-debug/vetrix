'use client';

import React from 'react';
import { useWallet } from '../context/WalletContext';

const InsightsPanel: React.FC = () => {
  const { balances, prices, history, loading } = useWallet();

  const totalValue = balances.reduce((acc, curr) => {
    const price = prices[curr.asset] || (curr.asset === 'USDC' || curr.asset === 'USDT' || curr.asset === 'DAI' ? 1 : 0);
    return acc + (parseFloat(curr.amount) * price);
  }, 0);

  if (loading && balances.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-16)' }}>
        <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          Portfolio Insights
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-16)' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '64px' }} />)}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Net Worth', value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'var(--accent-green)' },
    { label: 'Assets', value: balances.length.toString(), color: 'var(--text-primary)' },
    { label: 'Activity', value: history.length.toString(), color: 'var(--text-primary)' },
    { label: 'Network', value: 'Stable', color: 'var(--accent-green)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-16)' }}>
      <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
        Portfolio Insights
      </h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-16)' }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            padding: 'var(--s-16)',
            background: 'var(--bg-black)',
            border: '1px solid var(--border-neutral)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--s-4)',
          }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {stat.label}
            </span>
            <p style={{ fontSize: '16px', fontWeight: 700, color: stat.color, margin: 0 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;
