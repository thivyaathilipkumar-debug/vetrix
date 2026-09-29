'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DiscoverGrid from '@/components/DiscoverGrid';

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState<'Tokens' | 'Apps'>('Tokens');
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeCategory === 'Tokens') {
      fetchTokens();
    }
  }, [activeCategory]);

  const fetchTokens = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/wallet/tokens'); // Note: routing check—if it's /api/wallet/tokens
      const data = await res.json();
      if (Array.isArray(data)) {
        setTokens(data.map(t => ({
          name: t.name,
          description: `${t.symbol} — 24h Change: ${t.price_change_percentage_24h.toFixed(2)}%`,
          category: 'Asset',
          link: '#',
          icon: t.image,
          price: `$${t.current_price.toLocaleString()}`,
        })));
      }
    } catch (err) {
      console.error('Discover fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const apps = [
    { name: 'Uniswap', description: 'DeFi Swap & Liquidity', category: 'DEX', link: 'https://uniswap.org' },
    { name: 'Aave',    description: 'Borrow & Lend Assets', category: 'Lending', link: 'https://aave.com' },
    { name: 'OpenSea', description: 'NFT Marketplace',      category: 'NFT',     link: 'https://opensea.io' },
  ];

  return (
    <DashboardLayout>
      <div style={{
        flex: 1,
        padding: '0 var(--s-32) var(--s-32)',
        overflowY: 'auto'
      }} className="scrollbar-hidden">
        
        <div style={{ maxWidth: '1200px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: '#fff', 
            margin: 'var(--s-32) 0 var(--s-24) 0',
            letterSpacing: '-0.02em'
          }}>
            Discover
          </h1>

          {/* Category Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--s-32)', 
            marginBottom: 'var(--s-32)', 
            borderBottom: '1px solid var(--border-neutral)' 
          }}>
            {['Tokens', 'Apps'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                style={{
                  paddingBottom: 'var(--s-12)',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeCategory === cat ? '2px solid var(--accent-green)' : 'none',
                  color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-16)' }}>
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '120px' }} />)}
            </div>
          ) : (
            <div className="animate-fade-in">
              {activeCategory === 'Tokens' && tokens.length === 0 ? (
                <div style={{ 
                  padding: 'var(--s-64) 0', 
                  textAlign: 'center', 
                  color: 'var(--text-muted)' 
                }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>No tokens found</p>
                  <p style={{ fontSize: '12px', margin: 0 }}>Tokens will appear here once your wallet holds assets.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: activeCategory === 'Apps' ? 'repeat(3, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 'var(--s-16)',
                }}>
                  <DiscoverGrid items={activeCategory === 'Tokens' ? tokens : apps} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
