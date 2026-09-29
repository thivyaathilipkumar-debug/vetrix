'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Portfolio', path: '/chat' },
  { label: 'Chat',      path: '/chat' },
  { label: 'Discover',  path: '/discover' },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside style={{
      width: '240px',
      height: '100vh',
      background: 'var(--bg-black)',
      borderRight: '1px solid var(--border-neutral)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      padding: 'var(--s-32) var(--s-24)',
    }}>
      {/* Branding - Text Only */}
      <div style={{
        padding: '0 0 var(--s-32)',
        display: 'flex',
        alignItems: 'center',
      }}>
        <span className="fintech-heading" style={{
          fontSize: '22px',
          letterSpacing: '-0.02em',
          fontWeight: 800,
          color: 'var(--text-primary)',
        }}>
          Vetrix
        </span>
      </div>

      {/* Navigation - Text Only */}
      <nav style={{ flex: 1 }}>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--s-16)', // gap-4
        }}>
          {NAV_ITEMS.map((item) => {
            const isPortfolioPath = pathname === '/chat' && item.label === 'Portfolio';
            const isDiscoverPath = pathname === '/discover' && item.label === 'Discover';
            const isActive = isPortfolioPath || isDiscoverPath;

            return (
              <li key={item.label}>
                <button
                  onClick={() => router.push(item.path)}
                  style={{ 
                    width: '100%', 
                    border: 'none', 
                    background: 'transparent', 
                    cursor: 'pointer', 
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 700,
                    padding: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: isActive ? 'var(--accent-green)' : '#737373', // neutral-400
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.color = '#737373';
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Context - Text Only */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-4)',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Sepolia Network</div>
        <div className="text-label" style={{ fontSize: '9px', opacity: 0.4 }}>Status: ACTIVE</div>
      </div>
    </aside>
  );
};

export default Sidebar;
