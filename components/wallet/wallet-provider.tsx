"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "pact.wallet";

export interface WalletContextValue {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  connect: (address?: string) => Promise<string | null>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

declare global {
  interface Window {
    freighterApi?: {
      getPublicKey: () => Promise<string>;
      isConnected: () => Promise<{ isConnected: boolean }>;
    };
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async (preferred?: string) => {
    setConnecting(true);
    try {
      let next: string | null = null;

      if (preferred) {
        next = preferred;
      } else {
        const freighter =
          typeof window !== "undefined" ? window.freighterApi : undefined;
        if (freighter) {
          const { isConnected: linked } = await freighter.isConnected();
          if (linked) next = await freighter.getPublicKey();
        }
      }

      if (next) {
        setAddress(next);
        localStorage.setItem(STORAGE_KEY, next);
        return next;
      }
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      connected: Boolean(address),
      connecting,
      connect,
      disconnect,
    }),
    [address, connecting, connect, disconnect]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
