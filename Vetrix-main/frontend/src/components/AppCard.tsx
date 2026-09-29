'use client';

import React from 'react';

interface AppCardProps {
  title: string;
  description: string;
  category: string;
  icon?: string; // Kept for interface compatibility but ignored
  price?: string;
}

const AppCard: React.FC<AppCardProps> = ({ title, description, category }) => {
  return (
    <div style={{
      padding: 'var(--s-16)',
      background: '#0a0a0a',
      border: '1px solid var(--border-neutral)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: 'var(--s-12)',
      transition: 'border-color 0.15s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ 
          fontSize: '10px', 
          fontWeight: 700, 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {category}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: '0 0 4px 0' }}>{title}</h3>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--s-8)' }}>
        <button 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-green)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-green-h)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--accent-green)'}
        >
          Open
        </button>
      </div>
    </div>
  );
};

export default AppCard;
