"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  deriveAddressFromCredentialId,
  deriveSecretFromCredentialId,
} from "@/lib/wallet/keys";

const STORAGE_KEY = "pact.wallet";
const CREDENTIAL_KEY = "pact.passkey.credentialId";

export interface WalletContextValue {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  isPasskey: boolean;
  connect: (address?: string) => Promise<string | null>;
  signInWithPasskey: () => Promise<string | null>;
  exportPasskeySecret: () => Promise<string | null>;
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

  const savePasskey = useCallback(async (credentialId: string) => {
    const next = await deriveAddressFromCredentialId(credentialId);
    localStorage.setItem(CREDENTIAL_KEY, credentialId);
    localStorage.setItem(STORAGE_KEY, next);
    setAddress(next);
    return next;
  }, []);

  const signInWithPasskey = useCallback(async (): Promise<string | null> => {
    if (typeof window === "undefined" || !window.PublicKeyCredential) {
      throw new Error(
        "Passkeys are not supported in this browser. Use HTTPS or localhost."
      );
    }

    setConnecting(true);
    try {
      const rpId = window.location.hostname;
      const challenge = new Uint8Array(crypto.getRandomValues(new Uint8Array(32)));
      const storedCredentialId = localStorage.getItem(CREDENTIAL_KEY);

      if (storedCredentialId) {
        try {
          const assertion = (await navigator.credentials.get({
            publicKey: {
              challenge,
              rpId,
              allowCredentials: [
                {
                  type: "public-key",
                  id: new Uint8Array(base64UrlToBytes(storedCredentialId)),
                },
              ],
              userVerification: "required",
              timeout: 60000,
            },
          })) as PublicKeyCredential;
          return savePasskey(assertion.id);
        } catch {
          // Credential no longer exists on this device; register a fresh one.
        }
      }

      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { id: rpId, name: "Pact" },
          user: {
            id: new Uint8Array(crypto.getRandomValues(new Uint8Array(16))),
            name: `pact-${bytesToBase64Url(new Uint8Array(crypto.getRandomValues(new Uint8Array(4)))).slice(0, 6)}`,
            displayName: "Pact user",
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            residentKey: "preferred",
            userVerification: "required",
          },
          timeout: 60000,
          attestation: "none",
        },
      })) as PublicKeyCredential;

      return savePasskey(credential.id);
    } finally {
      setConnecting(false);
    }
  }, [savePasskey]);

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

  const exportPasskeySecret = useCallback(async (): Promise<string | null> => {
    const storedCredentialId = localStorage.getItem(CREDENTIAL_KEY);
    if (!storedCredentialId) return null;
    return deriveSecretFromCredentialId(storedCredentialId);
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
      isPasskey:
        typeof window !== "undefined" &&
        Boolean(localStorage.getItem(CREDENTIAL_KEY)),
      connect,
      signInWithPasskey,
      exportPasskeySecret,
      disconnect,
    }),
    [
      address,
      connecting,
      connect,
      signInWithPasskey,
      exportPasskeySecret,
      disconnect,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
