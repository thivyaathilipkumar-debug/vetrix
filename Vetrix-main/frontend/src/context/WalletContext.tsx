'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { ethers } from 'ethers';

export type TxStage =
  | 'idle'
  | 'signing'
  | 'broadcasting'
  | 'confirming'
  | 'confirmed'
  | 'failed';

export interface TxProgress {
  stage: TxStage;
  hash?: string;
  blockNumber?: number;
  confirmations?: number;
  error?: string;
}

interface WalletContextType {
  address: string | null;
  chainId: string | null;
  signer: ethers.JsonRpcSigner | null;
  provider: ethers.BrowserProvider | null;
  isConnected: boolean;
  isConnecting: boolean;
  balances: { asset: string; amount: string; isNative: boolean; contractAddress?: string }[];
  history: any[];
  prices: Record<string, number>;
  loading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  executeIntent: (intent: any) => Promise<string | null | undefined>;
  executeIntentWithProgress: (
    intent: any,
    onProgress: (p: TxProgress) => void
  ) => Promise<void>;
  refreshBalances: () => Promise<void>;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  chainId: null,
  signer: null,
  provider: null,
  isConnected: false,
  isConnecting: false,
  balances: [],
  history: [],
  prices: { ETH: 3200, USDC: 1, USDT: 1, DAI: 1 },
  loading: false,
  connect: async () => {},
  disconnect: () => {},
  executeIntent: async () => undefined,
  executeIntentWithProgress: async () => {},
  refreshBalances: async () => {},
  error: null,
});

export const useWallet = () => useContext(WalletContext);

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider & {
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

const API_BASE = 'http://localhost:3001/api';

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balances, setBalances] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({ ETH: 3200, USDC: 1, USDT: 1, DAI: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/market/prices`);
      const data = await res.json();
      if (data) setPrices(data);
    } catch (err) {
      console.error('Price fetch error:', err);
    }
  }, []);

  const fetchBalances = useCallback(async (walletAddress: string) => {
    try {
      const res = await fetch(`${API_BASE}/wallet/balance/${walletAddress}`);
      const data = await res.json();
      if (data.balances) setBalances(data.balances);
    } catch (err) {
      console.error('Balance fetch error:', err);
    }
  }, []);

  const fetchHistory = useCallback(async (walletAddress: string) => {
    try {
      const res = await fetch(`${API_BASE}/wallet/history/${walletAddress}`);
      const data = await res.json();
      if (data.transfers && Array.isArray(data.transfers)) setHistory(data.transfers);
    } catch (err) {
      console.error('History fetch error:', err);
    }
  }, []);

  const refreshBalances = useCallback(async () => {
    if (address) {
      setLoading(true);
      await Promise.all([
        fetchBalances(address),
        fetchHistory(address),
        fetchPrices(),
      ]);
      setLoading(false);
    }
  }, [address, fetchBalances, fetchHistory, fetchPrices]);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask is not installed.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum!);
      await browserProvider.send('eth_requestAccounts', []);

      const walletSigner = await browserProvider.getSigner();
      const walletAddress = await walletSigner.getAddress();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(walletSigner);
      setAddress(walletAddress);
      setChainId(network.chainId.toString());
      
      // Initial fetch
      await Promise.all([
        fetchBalances(walletAddress),
        fetchHistory(walletAddress),
        fetchPrices(),
      ]);
      // Native Session Memory
      localStorage.setItem('vetrix_connected', 'true');

    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalances, fetchHistory, fetchPrices]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
    setChainId(null);
    setBalances([]);
    setHistory([]);
    setError(null);
    localStorage.removeItem('vetrix_connected');
  }, []);

  const executeIntent = useCallback(async (intent: any) => {
    if (!signer || !address || !provider) {
      setError('Wallet not fully connected.');
      return;
    }

    try {
      if (intent.action === 'send_eth') {
        const tx = await signer.sendTransaction({
          to: intent.to_address,
          value: ethers.parseEther(intent.amount.toString()),
        });
        await tx.wait();
        await refreshBalances();
        return tx.hash;
      } else {
        setError(`Action ${intent.action} is not implemented.`);
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      throw err;
    }
  }, [signer, address, provider, refreshBalances]);

  const executeIntentWithProgress = useCallback(async (
    intent: any,
    onProgress: (p: TxProgress) => void
  ) => {
    if (!signer || !address || !provider) {
      onProgress({ stage: 'failed', error: 'Wallet not fully connected.' });
      return;
    }
    try {
      onProgress({ stage: 'signing' });

      if (intent.action === 'send_eth') {
        const tx = await signer.sendTransaction({
          to: intent.to_address,
          value: ethers.parseEther(intent.amount.toString()),
        });

        onProgress({ stage: 'broadcasting', hash: tx.hash });

        // Listen block-by-block for confirmation
        const receipt = await new Promise<ethers.TransactionReceipt>((resolve, reject) => {
          const onBlock = async (blockNumber: number) => {
            try {
              const r = await provider.getTransactionReceipt(tx.hash);
              if (r && r.status !== null) {
                provider.off('block', onBlock);
                if (r.status === 1) resolve(r);
                else reject(new Error('Transaction reverted on-chain.'));
              } else {
                onProgress({ stage: 'confirming', hash: tx.hash, blockNumber });
              }
            } catch (e) {
              provider.off('block', onBlock);
              reject(e);
            }
          };
          provider.on('block', onBlock);
          // Fallback via tx.wait
          tx.wait(1).then(r => {
            if (r) { provider.off('block', onBlock); resolve(r); }
          }).catch(e => { provider.off('block', onBlock); reject(e); });
        });

        onProgress({
          stage: 'confirmed',
          hash: tx.hash,
          blockNumber: receipt.blockNumber,
          confirmations: 1,
        });

        await refreshBalances();
      } else {
        onProgress({ stage: 'failed', error: `Action "${intent.action}" is not yet supported.` });
      }
    } catch (err: any) {
      onProgress({ stage: 'failed', error: err.message || 'Transaction failed.' });
    }
  }, [signer, address, provider, refreshBalances]);

  // Polling logic: Standardized to 12s for production efficiency
  useEffect(() => {
    if (!address) return;

    const interval = setInterval(() => {
      refreshBalances().catch(err => console.error('Auto-refresh sync error:', err));
    }, 12000); 

    return () => clearInterval(interval);
  }, [address, refreshBalances]);

  // Session Memory: Check if a user previously established a connection intent
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (typeof window === 'undefined' || !window.ethereum) return;

    // Only attempt silent connection if they previously clicked "Connect Wallet" 
    if (localStorage.getItem('vetrix_connected') === 'true') {
      const checkConnection = async () => {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum!);
          const accounts = await browserProvider.listAccounts();

          if (accounts.length > 0) {
            const walletSigner = await browserProvider.getSigner();
            const network = await browserProvider.getNetwork();
            const walletAddress = await walletSigner.getAddress();

            setProvider(browserProvider);
            setSigner(walletSigner);
            setAddress(walletAddress);
            setChainId(network.chainId.toString());
            
            await Promise.all([
              fetchBalances(walletAddress),
              fetchHistory(walletAddress),
              fetchPrices(),
            ]);
          }
        } catch (err) {
          console.error('Auto-connect context recovery error:', err);
        }
      };
      checkConnection();
    }
  }, [fetchBalances, fetchHistory, fetchPrices]);

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        signer,
        provider,
        isConnected: !!address,
        isConnecting,
        balances,
        history,
        prices,
        loading,
        connect,
        disconnect,
        executeIntent,
        executeIntentWithProgress,
        refreshBalances,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;
