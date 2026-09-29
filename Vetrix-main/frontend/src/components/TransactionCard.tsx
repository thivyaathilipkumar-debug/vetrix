'use client';

import React, { useState } from 'react';
import { useWallet, TxStage, TxProgress } from '../context/WalletContext';

interface IntentData {
  action: string;
  chain: string | null;
  asset: string | null;
  amount: string | null;
  to_address: string | null;
  tokenAddress: string | null;
  gasEstimate: string | null;
  gasPriceGwei: string | null;
  confidence: number;
  risk_flags: string[];
  human_readable_summary?: string;
}

interface TransactionCardProps {
  intent: IntentData;
  /** Called when tx is confirmed — injects a result message into the chat */
  onConfirmed?: (summary: string, hash: string) => void;
}

const short = (addr: string | null) =>
  addr && addr.length > 14 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : (addr ?? '');

// ── Stage config ──────────────────────────────────────────────────────────
const STAGES: { key: TxStage; label: string; desc: string }[] = [
  { key: 'signing',     label: 'Awaiting Signature', desc: 'Confirm in MetaMask'         },
  { key: 'broadcasting',label: 'Broadcasting',        desc: 'Sending to the network'      },
  { key: 'confirming',  label: 'Confirming',          desc: 'Waiting for a block'         },
  { key: 'confirmed',   label: 'Confirmed',           desc: 'Transaction on-chain'        },
];

const STAGE_ORDER: TxStage[] = ['signing', 'broadcasting', 'confirming', 'confirmed'];

function stageIndex(s: TxStage) {
  return STAGE_ORDER.indexOf(s);
}

// ── Spinner ───────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{
      width: 14, height: 14, borderRadius: '50%',
      border: '2px solid rgba(34,197,94,0.2)',
      borderTopColor: 'var(--accent-green)',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

export default function TransactionCard({ intent, onConfirmed }: TransactionCardProps) {
  const { executeIntentWithProgress } = useWallet();
  const [progress, setProgress] = useState<TxProgress>({ stage: 'idle' });
  const [cancelled, setCancelled] = useState(false);
  const [latestBlock, setLatestBlock] = useState<number | null>(null);

  const handleConfirm = () => {
    executeIntentWithProgress(intent, (p) => {
      setProgress(p);
      if (p.blockNumber) setLatestBlock(p.blockNumber);
      if (p.stage === 'confirmed' && onConfirmed && p.hash) {
        const summary =
          `✅ Done. Sent ${intent.amount} ${intent.asset?.toUpperCase()} to ${short(intent.to_address)} on ${intent.chain || 'Sepolia'}.\n` +
          `Block #${p.blockNumber} · [View on Etherscan](https://sepolia.etherscan.io/tx/${p.hash})`;
        onConfirmed(summary, p.hash);
      }
    });
  };

  const isActive = progress.stage !== 'idle';
  const currentIdx = stageIndex(progress.stage);

  // ── Cancelled ─────────────────────────────────────────────────────────
  if (cancelled) {
    return (
      <div style={cardStyle('rgba(239,68,68,0.06)', 'rgba(239,68,68,0.15)')}>
        <span style={{ fontSize: '13px', color: 'var(--accent-red)', fontWeight: 600 }}>
          Transaction cancelled.
        </span>
      </div>
    );
  }

  // ── Failed ────────────────────────────────────────────────────────────
  if (progress.stage === 'failed') {
    return (
      <div style={cardStyle('rgba(239,68,68,0.06)', 'rgba(239,68,68,0.15)')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '16px' }}>❌</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-red)' }}>Transaction Failed</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{progress.error}</p>
      </div>
    );
  }

  // ── Confirmed ─────────────────────────────────────────────────────────
  if (progress.stage === 'confirmed') {
    return (
      <div className="animate-fade-in" style={cardStyle('rgba(34,197,94,0.05)', 'rgba(34,197,94,0.2)')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '18px' }}>✅</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)' }}>Confirmed on-chain</span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Sent <strong style={{ color: '#fff' }}>{intent.amount} {intent.asset?.toUpperCase()}</strong> to{' '}
          <strong style={{ color: '#fff' }}>{short(intent.to_address)}</strong>
          {latestBlock && <> · Block <strong style={{ color: '#fff' }}>#{latestBlock}</strong></>}
        </div>
        {progress.hash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${progress.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', marginTop: '10px',
              fontSize: '11px', color: 'var(--accent-green)',
              textDecoration: 'underline', wordBreak: 'break-all',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {progress.hash.slice(0, 20)}...{progress.hash.slice(-8)} ↗
          </a>
        )}
      </div>
    );
  }

  // ── Idle: confirmation prompt ─────────────────────────────────────────
  if (!isActive) {
    return (
      <div style={cardStyle('rgba(0,0,0,0.3)', 'var(--border-neutral)')}>
        {/* Summary */}
        <div style={{ marginBottom: '14px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <span style={{ marginRight: '6px' }}>🛡️</span>
          <strong style={{ color: 'var(--text-primary)' }}>Safety check passed.</strong>{' '}
          Sending <strong style={{ color: '#fff' }}>{intent.amount} {intent.asset?.toUpperCase()}</strong> to{' '}
          <strong style={{ color: '#fff' }}>{short(intent.to_address)}</strong>.{' '}
          Gas ≈ <span style={{ fontFamily: 'monospace' }}>{intent.gasEstimate || '~0.0002'} ETH</span>.{' '}
          <strong style={{ color: 'var(--accent-red)' }}>Irreversible.</strong>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleConfirm} style={btnStyle('var(--accent-green)', '#000')}>
            Confirm
          </button>
          <button onClick={() => setCancelled(true)} style={btnStyle('transparent', 'var(--text-muted)', true)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── In-progress: live timeline ────────────────────────────────────────
  return (
    <div style={cardStyle('rgba(0,0,0,0.4)', 'rgba(34,197,94,0.15)')}>
      <div style={{ marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
        Sending <strong style={{ color: '#fff' }}>{intent.amount} {intent.asset?.toUpperCase()}</strong> to{' '}
        <strong style={{ color: '#fff' }}>{short(intent.to_address)}</strong>
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {STAGES.map((s, i) => {
          const done = currentIdx > i;
          const active = currentIdx === i;
          const pending = currentIdx < i;

          return (
            <div key={s.key} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {/* Track */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                {/* Node */}
                <div style={{
                  width: 20, height: 20,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done
                    ? 'var(--accent-green)'
                    : active
                    ? 'rgba(34,197,94,0.15)'
                    : 'rgba(255,255,255,0.04)',
                  border: done
                    ? '2px solid var(--accent-green)'
                    : active
                    ? '2px solid var(--accent-green)'
                    : '2px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}>
                  {done ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : active ? (
                    <Spinner />
                  ) : (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                  )}
                </div>
                {/* Connector line */}
                {i < STAGES.length - 1 && (
                  <div style={{
                    width: 2, height: 24,
                    background: done ? 'var(--accent-green)' : 'rgba(255,255,255,0.06)',
                    transition: 'background 0.4s ease',
                    margin: '2px 0',
                  }} />
                )}
              </div>

              {/* Label */}
              <div style={{ paddingBottom: i < STAGES.length - 1 ? '0' : '0', paddingTop: '1px', minHeight: 20 + (i < STAGES.length - 1 ? 28 : 0) }}>
                <div style={{
                  fontSize: '12px', fontWeight: 700,
                  color: done ? 'var(--accent-green)' : active ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'color 0.3s',
                }}>
                  {s.label}
                  {s.key === 'confirming' && latestBlock && active && (
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>
                      block #{latestBlock}
                    </span>
                  )}
                </div>
                {active && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {s.desc}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hash pill once broadcasting */}
      {progress.hash && (
        <div style={{
          marginTop: '14px', padding: '6px 10px',
          borderRadius: '8px', background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-neutral)',
          fontSize: '10px', fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-muted)', wordBreak: 'break-all',
        }}>
          {progress.hash}
        </div>
      )}
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────
function cardStyle(bg: string, border: string): React.CSSProperties {
  return {
    padding: '16px',
    borderRadius: '14px',
    background: bg,
    border: `1px solid ${border}`,
    transition: 'all 0.3s ease',
  };
}

function btnStyle(bg: string, color: string, ghost = false): React.CSSProperties {
  return {
    padding: '8px 18px',
    borderRadius: '100px',
    background: bg,
    border: ghost ? '1px solid rgba(255,255,255,0.08)' : 'none',
    color,
    fontSize: '12px', fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
  };
}
