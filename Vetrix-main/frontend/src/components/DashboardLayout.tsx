'use client';

import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="bg-dot-grid" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--bg-black)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Luxury Glassmorphism Orbs for Wow Factor */}
      <div className="glow-orb" style={{ top: '10%', left: '10%' }} />
      <div className="glow-orb" style={{ bottom: '10%', right: '10%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)', animationDelay: '-5s' }} />

      {/* Unified Canvas (Wallet App Boundary) */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '440px', // Phantom / TrustWallet native width
        height: '90vh',
        maxHeight: '880px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
