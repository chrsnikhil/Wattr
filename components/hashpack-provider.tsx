'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface HashPackContextType {
  isConnected: boolean;
  accountId: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
}

const HashPackContext = createContext<HashPackContextType | undefined>(undefined);

export function useHashPack() {
  const context = useContext(HashPackContext);
  if (context === undefined) {
    throw new Error('useHashPack must be used within a HashPackProvider');
  }
  return context;
}

interface HashPackProviderProps {
  children: React.ReactNode;
}

export function HashPackProvider({ children }: HashPackProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hashConnect, setHashConnect] = useState<any>(null);
  const [pairingData, setPairingData] = useState<any>(null);

  // Initialize HashConnect only on client side
  useEffect(() => {
    const initHashConnect = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Dynamic import to avoid SSR issues
        const { HashConnect, HashConnectConnectionState } = await import('hashconnect');
        const { LedgerId } = await import('@hashgraph/sdk');

        const appMetadata = {
          name: "EnergyFi",
          description: "Energy Trading Platform",
          icons: ["https://your-app-icon.com/icon.png"],
          url: "https://your-app-url.com"
        };

        // Get project ID from environment or use a placeholder for development
        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";
        
        if (projectId === "YOUR_PROJECT_ID") {
          console.warn('HashPack: Using placeholder project ID. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable.');
        }

        // Create HashConnect instance with testnet for development
        const hashConnectInstance = new HashConnect(LedgerId.TESTNET, projectId, appMetadata, true);
        setHashConnect(hashConnectInstance);

        // Set up events
        hashConnectInstance.pairingEvent.on((newPairing: any) => {
          console.log('HashPack: New pairing:', newPairing);
          setPairingData(newPairing);
          if (newPairing.accountIds && newPairing.accountIds.length > 0) {
            setAccountId(newPairing.accountIds[0]);
            setIsConnected(true);
          }
        });

        hashConnectInstance.disconnectionEvent.on((data: any) => {
          console.log('HashPack: Disconnected:', data);
          setPairingData(null);
          setAccountId(null);
          setIsConnected(false);
        });

        hashConnectInstance.connectionStatusChangeEvent.on((connectionStatus: any) => {
          console.log('HashPack: Connection status changed:', connectionStatus);
          if (connectionStatus === HashConnectConnectionState.Connected || 
              connectionStatus === HashConnectConnectionState.Paired) {
            setIsConnected(true);
          } else {
            setIsConnected(false);
          }
        });

        // Initialize HashConnect
        await hashConnectInstance.init();
        console.log('HashPack: Initialized successfully');

      } catch (error) {
        console.error('HashPack: Failed to initialize HashConnect:', error);
      }
    };

    initHashConnect();
  }, []);

  const connect = async () => {
    console.log('HashPack: Attempting to connect...');
    setIsLoading(true);
    try {
      if (hashConnect) {
        // Open pairing modal
        hashConnect.openPairingModal();
        console.log('HashPack: Opened pairing modal');
      } else {
        console.log('HashPack: HashConnect not initialized');
        // Fallback to mock connection for development
        const mockAccountId = '0.0.1234567';
        setAccountId(mockAccountId);
        setIsConnected(true);
        console.log('HashPack: Using mock connection:', mockAccountId);
      }
    } catch (error) {
      console.error('HashPack: Failed to connect wallet:', error);
      // Fallback to mock connection
      const mockAccountId = '0.0.1234567';
      setAccountId(mockAccountId);
      setIsConnected(true);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    console.log('HashPack: Disconnecting...');
    if (hashConnect) {
      hashConnect.disconnect();
    }
    setPairingData(null);
    setAccountId(null);
    setIsConnected(false);
  };

  // Debug effect to log state changes
  useEffect(() => {
    console.log('HashPack: State changed - isConnected:', isConnected, 'accountId:', accountId);
  }, [isConnected, accountId]);

  const value: HashPackContextType = {
    isConnected,
    accountId,
    connect,
    disconnect,
    isLoading,
  };

  return (
    <HashPackContext.Provider value={value}>
      {children}
    </HashPackContext.Provider>
  );
} 