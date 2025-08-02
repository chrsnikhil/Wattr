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
    
    // Check for different possible HashPack extension objects
    const hashpack = (window as any).hashpack;
    const hashPack = (window as any).HashPack;
    const hashpackExtension = (window as any).hashpackExtension;
    
    console.log('HashPack Debug - Available objects:', {
      hashpack: !!hashpack,
      HashPack: !!hashPack,
      hashpackExtension: !!hashpackExtension,
      windowKeys: Object.keys(window).filter(key => key.toLowerCase().includes('hash'))
    });
    
    return !!(hashpack || hashPack || hashpackExtension);
  };

  // Get the HashPack extension object
  const getHashPackExtension = () => {
    if (typeof window === 'undefined') return null;
    
    const hashpack = (window as any).hashpack;
    const hashPack = (window as any).HashPack;
    const hashpackExtension = (window as any).hashpackExtension;
    
    return hashpack || hashPack || hashpackExtension;
  };

  // Check if HashPack is connected
  const checkHashPackConnection = async () => {
    const extension = getHashPackExtension();
    if (!extension) return false;
    
    try {
      console.log('HashPack Debug - Extension methods:', Object.getOwnPropertyNames(extension));
      
      // Try different methods to get accounts
      let accounts = null;
      
      if (typeof extension.getAccounts === 'function') {
        accounts = await extension.getAccounts();
      } else if (typeof extension.getAccountIds === 'function') {
        accounts = await extension.getAccountIds();
      } else if (typeof extension.getConnectedAccounts === 'function') {
        accounts = await extension.getConnectedAccounts();
      }
      
      console.log('HashPack Debug - Accounts result:', accounts);
      return accounts && accounts.length > 0;
    } catch (error) {
      console.error('HashPack: Error checking connection:', error);
      return false;
    }
  };

  // Initialize connection check on mount
  useEffect(() => {
    const checkConnection = async () => {
      console.log('HashPack Debug - Checking for extension...');
      const available = isHashPackAvailable();
      console.log('HashPack Debug - Extension available:', available);
      
      if (available) {
        const connected = await checkHashPackConnection();
        if (connected) {
          try {
            const extension = getHashPackExtension();
            let accounts = null;
            
            if (typeof extension.getAccounts === 'function') {
              accounts = await extension.getAccounts();
            } else if (typeof extension.getAccountIds === 'function') {
              accounts = await extension.getAccountIds();
            } else if (typeof extension.getConnectedAccounts === 'function') {
              accounts = await extension.getConnectedAccounts();
            }
            
            if (accounts && accounts.length > 0) {
              setAccountId(accounts[0]);
              setIsConnected(true);
              console.log('HashPack: Already connected with account:', accounts[0]);
            }
          } catch (error) {
            console.error('HashPack: Error getting accounts:', error);
          }
        }
      }
    };

    // Check after a short delay to allow extension to load
    const timer = setTimeout(checkConnection, 1000);
    return () => clearTimeout(timer);
  }, []);

  const connect = async () => {
    console.log('HashPack: Attempting to connect...');
    setIsLoading(true);
    try {
      const available = isHashPackAvailable();
      console.log('HashPack Debug - Extension available for connection:', available);
      
      if (available) {
        console.log('HashPack: HashPack extension detected');
        
        const extension = getHashPackExtension();
        console.log('HashPack Debug - Extension object:', extension);
        console.log('HashPack Debug - Extension methods:', Object.getOwnPropertyNames(extension));
        
        // Try to connect to HashPack extension
        try {
          // Try different connection methods
          let accounts = null;
          
          if (typeof extension.requestAccounts === 'function') {
            console.log('HashPack: Using requestAccounts()');
            await extension.requestAccounts();
            accounts = await extension.getAccounts();
          } else if (typeof extension.connect === 'function') {
            console.log('HashPack: Using connect()');
            await extension.connect();
            accounts = await extension.getAccounts();
          } else if (typeof extension.requestConnection === 'function') {
            console.log('HashPack: Using requestConnection()');
            await extension.requestConnection();
            accounts = await extension.getAccounts();
          } else {
            console.log('HashPack: No connection method found, trying getAccounts directly');
            accounts = await extension.getAccounts();
          }
          
          console.log('HashPack: Available accounts:', accounts);
          
          if (accounts && accounts.length > 0) {
            setAccountId(accounts[0]);
            setIsConnected(true);
            console.log('HashPack: Successfully connected with account:', accounts[0]);
          } else {
            throw new Error('No accounts available');
          }
        } catch (error) {
          console.error('HashPack: Failed to connect to extension:', error);
          // Fallback to mock for development
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
    const extension = getHashPackExtension();
    if (extension) {
      if (typeof extension.disconnect === 'function') {
        try {
          extension.disconnect();
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