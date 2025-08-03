'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface HashPackContextType {
  isConnected: boolean;
  accountId: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  error: string | null;
}

const HashPackContext = createContext<HashPackContextType | undefined>(
  undefined,
);

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
  const [error, setError] = useState<string | null>(null);
  const [hashConnect, setHashConnect] = useState<any>(null);
  const [pairingData, setPairingData] = useState<any>(null);

  // Initialize HashConnect only on client side
  useEffect(() => {
    const initHashConnect = async () => {
      if (typeof window === 'undefined') return;

      try {
        setError(null);
        console.log('HashPack: Starting initialization...');

        // Check for environment variable
        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

        if (!projectId || projectId === 'YOUR_PROJECT_ID') {
          const errorMsg =
            'HashPack: WalletConnect Project ID not configured. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable.';
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }

        // Dynamic import to avoid SSR issues
        const { HashConnect, HashConnectConnectionState } = await import(
          'hashconnect'
        );
        const { LedgerId } = await import('@hashgraph/sdk');

        const appMetadata = {
          name: 'Wattr',
          description: 'Decentralized Energy Trading Platform',
          icons: ['https://wattr.app/icon.png'],
          url: window.location.origin,
        };

        console.log(
          'HashPack: Creating HashConnect instance with project ID:',
          projectId,
        );

        // Create HashConnect instance with testnet for development
        const hashConnectInstance = new HashConnect(
          LedgerId.TESTNET,
          projectId,
          appMetadata,
          true,
        );

        // Set up event listeners before initialization
        hashConnectInstance.pairingEvent.on((newPairing: any) => {
          console.log('HashPack: New pairing event:', newPairing);
          setPairingData(newPairing);

          // Check if we have account IDs in the pairing data
          if (
            newPairing &&
            newPairing.accountIds &&
            newPairing.accountIds.length > 0
          ) {
            const primaryAccountId = newPairing.accountIds[0];
            console.log('HashPack: Setting account ID:', primaryAccountId);
            setAccountId(primaryAccountId);
            setIsConnected(true);
            setError(null);
          }
        });

        hashConnectInstance.disconnectionEvent.on((data: any) => {
          console.log('HashPack: Disconnection event:', data);
          setPairingData(null);
          setAccountId(null);
          setIsConnected(false);
          setError(null);
        });

        hashConnectInstance.connectionStatusChangeEvent.on(
          (connectionStatus: any) => {
            console.log(
              'HashPack: Connection status changed:',
              connectionStatus,
            );

            if (connectionStatus === HashConnectConnectionState.Connected) {
              console.log('HashPack: Connected state detected');
              setIsConnected(true);
            } else if (connectionStatus === HashConnectConnectionState.Paired) {
              console.log('HashPack: Paired state detected');
              setIsConnected(true);
            } else {
              console.log('HashPack: Not connected state:', connectionStatus);
              setIsConnected(false);
            }
          },
        );

        // Initialize HashConnect
        console.log('HashPack: Initializing HashConnect...');
        await hashConnectInstance.init();

        setHashConnect(hashConnectInstance);
        console.log('HashPack: HashConnect initialized successfully');

        // Note: In HashConnect v3, we rely on events for pairing status
        // The connection will be restored automatically if there's an existing pairing
      } catch (error) {
        const errorMsg = `HashPack: Failed to initialize - ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMsg, error);
        setError(errorMsg);
      }
    };

    initHashConnect();
  }, []);

  const connect = async () => {
    console.log('HashPack: Connect called');
    setIsLoading(true);
    setError(null);

    try {
      if (!hashConnect) {
        throw new Error(
          'HashConnect not initialized. Please check your WalletConnect Project ID configuration.',
        );
      }

      console.log('HashPack: Opening pairing modal...');
      await hashConnect.openPairingModal();
      console.log('HashPack: Pairing modal opened successfully');
    } catch (error) {
      const errorMsg = `Failed to open HashPack pairing modal: ${error instanceof Error ? error.message : String(error)}`;
      console.error('HashPack: Connect error:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    console.log('HashPack: Disconnect called');
    setError(null);

    try {
      if (hashConnect) {
        hashConnect.disconnect();
      }
      setPairingData(null);
      setAccountId(null);
      setIsConnected(false);
      console.log('HashPack: Disconnected successfully');
    } catch (error) {
      console.error('HashPack: Error during disconnect:', error);
    }
  };

  // Debug effect to log state changes
  useEffect(() => {
    console.log(
      'HashPack: State changed - isConnected:',
      isConnected,
      'accountId:',
      accountId,
      'error:',
      error,
    );
  }, [isConnected, accountId, error]);

  const value: HashPackContextType = {
    isConnected,
    accountId,
    connect,
    disconnect,
    isLoading,
    error,
  };

  return (
    <HashPackContext.Provider value={value}>
      {children}
    </HashPackContext.Provider>
  );
}
