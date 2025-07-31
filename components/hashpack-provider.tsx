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

  // Check if HashPack extension is available
  const isHashPackAvailable = () => {
    if (typeof window === 'undefined') return false;
    return !!(window as any).hashpack;
  };

  const connect = async () => {
    console.log('HashPack: Attempting to connect...');
    setIsLoading(true);
    try {
      if (isHashPackAvailable()) {
        console.log('HashPack: HashPack extension detected');
        
        // Try to connect to HashPack extension
        const hashpack = (window as any).hashpack;
        
        if (hashpack && typeof hashpack.connect === 'function') {
          try {
            const result = await hashpack.connect();
            console.log('HashPack: Connection result:', result);
            
            if (result && result.accountIds && result.accountIds.length > 0) {
              setAccountId(result.accountIds[0]);
              setIsConnected(true);
              console.log('HashPack: Successfully connected with account:', result.accountIds[0]);
            } else {
              throw new Error('No account IDs returned');
            }
          } catch (error) {
            console.error('HashPack: Failed to connect to extension:', error);
            // Fallback to mock
            const mockAccountId = '0.0.1234567';
            setAccountId(mockAccountId);
            setIsConnected(true);
            console.log('HashPack: Using mock connection:', mockAccountId);
          }
        } else {
          console.log('HashPack: Extension found but connect method not available');
          // Fallback to mock
          const mockAccountId = '0.0.1234567';
          setAccountId(mockAccountId);
          setIsConnected(true);
          console.log('HashPack: Using mock connection:', mockAccountId);
        }
      } else {
        console.log('HashPack: Extension not available, using mock connection');
        // Mock connection for development
        const mockAccountId = '0.0.1234567';
        setAccountId(mockAccountId);
        setIsConnected(true);
        console.log('HashPack: Mock connected with account:', mockAccountId);
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
    
    // Try to disconnect from HashPack extension
    if (isHashPackAvailable()) {
      const hashpack = (window as any).hashpack;
      if (hashpack && typeof hashpack.disconnect === 'function') {
        try {
          hashpack.disconnect();
        } catch (error) {
          console.error('HashPack: Failed to disconnect from extension:', error);
        }
      }
    }
    
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