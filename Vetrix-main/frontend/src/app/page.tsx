'use client';

import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { connect, address, error } = useWallet();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    await connect();
    setIsConnecting(false);
  };

  const handleLaunch = async () => {
    if (address) {
      router.push('/chat');
    } else {
      setIsConnecting(true);
      await connect();
      setIsConnecting(false);
      // Wait for wallet context to populate before routing
      setTimeout(() => router.push('/chat'), 500); 
    }
  };

  return (
    <div className="bg-dot-grid" style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-black)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2vw',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Outer Browser/App Window Frame */}
      <div style={{
        backgroundColor: 'var(--bg-depth)',
        width: '100%',
        maxWidth: '1200px',
        borderRadius: '24px',
        border: '1px solid var(--border-neutral)',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Top Navbar */}
        <nav style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 40px', borderBottom: '1px solid var(--border-neutral)',
          position: 'relative', zIndex: 10
        }}>
          {/* Logo */}
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '-0.03em' }}>
            Vetrix
          </div>

          {/* Links */}
          <div style={{
            display: 'flex', gap: '32px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)'
          }}>
            <div style={{ color: 'var(--accent-green)', position: 'relative', cursor: 'pointer' }}>
              AI Agents
              <div style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%', height: '2px', backgroundColor: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)' }} />
            </div>
            <div style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Protocol</div>
            <div style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Analytics</div>
            <div style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Governance</div>
          </div>

          {/* Connect Button */}
          <button 
            onClick={address ? () => router.push('/chat') : handleConnect}
            disabled={isConnecting}
            style={{
            backgroundColor: address ? 'transparent' : 'var(--accent-green)',
            color: address ? 'var(--accent-green)' : '#000',
            border: address ? '1px solid var(--accent-green)' : 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: address ? 'none' : '0 0 15px rgba(34, 197, 94, 0.4)',
            transition: 'all 0.2s'
          }}>
            {isConnecting ? '...' : address ? `Connected: ${address.slice(0,6)}...` : 'Connect Wallet'}
          </button>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10, padding: '60px 24px' }}>
          
          {/* System Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '100px',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            backgroundColor: 'rgba(34, 197, 94, 0.05)',
            color: 'var(--accent-green)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em',
            marginBottom: '40px'
          }}>
            <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-green)', borderRadius: '50%', boxShadow: '0 0 8px var(--accent-green)' }} />
            SYSTEM V4.0 ACTIVE
          </div>

          {/* Hero Typography */}
          <div style={{ textAlign: 'center', maxWidth: '800px' }}>
            <h1 style={{
              fontSize: 'min(64px, 8vw)', fontWeight: 900, color: 'var(--text-primary)',
              letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0
            }}>
              THE AUTONOMOUS
            </h1>
            <h1 style={{
              fontSize: 'min(64px, 8vw)', fontWeight: 900,
              letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0,
              display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '16px',
            }}>
              COMMAND FOR <span style={{ color: 'var(--accent-green)', textShadow: '0 0 40px rgba(34, 197, 94, 0.4)' }}>WEB3</span>
            </h1>

            <p style={{
              fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 400,
              maxWidth: '600px', margin: '32px auto', lineHeight: 1.6
            }}>
              Vetrix leverages neural-linked execution layers to automate your DeFi strategy, multi-chain security, and asset routing through a single cognitive interface.
            </p>
          </div>

          {error && <div style={{ color: 'var(--accent-red)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

          {/* Call to Actions */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', marginBottom: '80px' }}>
            <button 
              onClick={handleLaunch}
              className="fintech-card-hover"
              style={{
              backgroundColor: 'var(--accent-green)', color: '#000',
              border: 'none', padding: '16px 32px', borderRadius: '12px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)',
              transition: 'transform 0.2s',
            }}>
              {isConnecting ? 'Linking...' : 'Launch Command Center'}
            </button>
            <button className="fintech-card-hover" style={{
              backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)',
              border: '1px solid var(--border-neutral)', padding: '16px 32px', borderRadius: '12px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer'
            }}>
              View Protocol Docs
            </button>
          </div>

          {/* Feature Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px', width: '100%', maxWidth: '1000px',
            borderTop: '1px solid var(--border-neutral)', paddingTop: '40px'
          }}>
            {/* Feature 1 */}
            <div style={{
              padding: '24px',
              borderRight: '1px solid var(--border-neutral)',
            }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-green)', fontSize: '18px', marginBottom: '20px' }}>↬</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Autonomous Routing</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>Intelligent liquidity optimization across 40+ chains. Our AI predicts slippage and gas spikes before they occur.</p>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '0.1em', cursor: 'pointer' }}>DEPLOY PROTOCOL →</div>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: '24px',
              borderRight: '1px solid var(--border-neutral)',
            }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-green)', fontSize: '18px', marginBottom: '20px' }}>🛡</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>AI-Powered Security</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>Real-time threat detection and automated contract revocation. Neural safeguards against bridge exploits and rugpulls.</p>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '0.1em', cursor: 'pointer' }}>CHECK SAFETY SCORE →</div>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: '24px',
            }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-green)', fontSize: '18px', marginBottom: '20px' }}>⇄</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>Instant Multi-Chain</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>One-click cross-chain execution. Swap assets between L2s and L1s with zero manual bridging required.</p>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '0.1em', cursor: 'pointer' }}>EXPLORE BRIDGES →</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
