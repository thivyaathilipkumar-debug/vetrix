import React, { useEffect, useState } from 'react';

const MESSAGES = [
  'Vetrix is analyzing your request...',
  'Checking transaction safety...',
  'Preparing secure execution...',
  'Processing your transaction...',
  'Finalizing securely...'
];

const TRUST_SIGNALS = [
  '🔐 End-to-end encrypted',
  '🛡️ Fraud check passed',
  '⚡ Optimized for lowest fees'
];

export default function TxProcessingLoader() {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [signalIndex, setSignalIndex] = useState(0);

  useEffect(() => {
    // Smooth progress bar: completes over ~3-4 seconds
    const interval = setInterval(() => {
      setProgress(p => {
        if (p < 90) return p + ((90 - p) * 0.15 + 1.2); 
        if (p < 98) return p + 0.3;
        return p;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Dynamic text sequence
    const times = [0, 600, 1400, 2200, 3200];
    const timeouts = times.map((t, i) => setTimeout(() => {
      setMsgIndex(i);
    }, t));
    return () => timeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    // Subtly rotate trust signals
    const interval = setInterval(() => {
      setSignalIndex(i => (i + 1) % TRUST_SIGNALS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in fintech-card" style={{
      padding: '16px 20px',
      maxWidth: '360px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      background: 'rgba(10, 10, 10, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(34, 197, 94, 0.15)',
      boxShadow: '0 8px 32px rgba(34, 197, 94, 0.05)',
    }}>
      {/* Top: Icon + Dynamic Text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          position: 'relative',
          width: '28px', height: '28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* Subtle breathing background pulse */}
          <div style={{
            position: 'absolute', inset: -4,
            background: 'var(--accent-green)', 
            opacity: 0.15,
            borderRadius: '50%',
            animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)'
          }} />
          {/* Shield Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 600, 
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          animation: 'fade-in 0.3s ease-out'
        }} key={msgIndex}>
          {MESSAGES[msgIndex]}
        </div>
      </div>

      {/* Middle: Progress Bar */}
      <div style={{ 
        width: '100%', 
        height: '4px', 
        background: 'rgba(255,255,255,0.06)', 
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #3b82f6, var(--accent-green))',
          borderRadius: '2px',
          transition: 'width 0.1s linear',
          boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)'
        }} />
      </div>

      {/* Bottom: Trust Signal */}
      <div style={{ 
        fontSize: '11px', 
        color: 'var(--accent-green)', 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        opacity: 0.8
      }}>
        <div style={{ 
          animation: 'fade-in 0.5s ease-out'
        }} key={signalIndex}>
          {TRUST_SIGNALS[signalIndex]}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
           fontSize: '10px', 
           color: 'var(--text-muted)', 
           fontFamily: 'JetBrains Mono, monospace' 
        }}>
          [{Math.floor(progress)}%]
        </div>
      </div>
    </div>
  );
}
