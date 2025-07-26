'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, User, RefreshCw, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ConnectWalletButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Reset connecting state when authentication status changes
  useEffect(() => {
    if (authenticated) {
      setIsConnecting(false);
      setConnectionAttempts(0);
      setConnectionError(null);
    }
  }, [authenticated]);

  // Handle wallet connection with better error handling
  const handleWalletConnection = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    setConnectionAttempts(prev => prev + 1);
    
    try {
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && !window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask extension.');
      }

      await login();
      
      // If we reach here, connection was successful
      setIsConnecting(false);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      // Set user-friendly error message
      if (error.message?.includes('MetaMask not found')) {
        setConnectionError('Please install MetaMask extension');
      } else if (error.message?.includes('User rejected')) {
        setConnectionError('Connection was cancelled');
      } else if (error.message?.includes('timeout')) {
        setConnectionError('Connection timed out. Please try again.');
      } else {
        setConnectionError('Connection failed. Please try again.');
      }
      
      // Don't reset connecting state immediately - let user see the error
      setTimeout(() => {
        setIsConnecting(false);
      }, 3000);
    }
  };

  // Reset error and retry
  const handleRetry = () => {
    setConnectionError(null);
    setIsConnecting(false);
    setConnectionAttempts(0);
  };

  // Show loading state while Privy is initializing
  if (!ready) {
    return (
      <Button
        variant="outline"
        className="bg-white border-4 border-black text-black font-black font-mono px-6 py-2 shadow-[4px_4px_0px_0px_#4a5568]"
        disabled
      >
        LOADING...
      </Button>
    );
  }

  // If user is authenticated, show user info and logout button
  if (authenticated && user) {
    const userDisplay = user.email?.address || 
                       (user.wallet?.address ? `${user.wallet.address.slice(0, 6)}...` : 'Connected');
    
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#4a5568]">
          <User className="w-4 h-4 text-black" />
          <span className="text-sm font-bold font-mono text-black">
            {userDisplay}
          </span>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          className="bg-white border-4 border-black text-black hover:bg-gray-100 font-black font-mono px-4 py-2 shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
        >
          <LogOut className="w-4 h-4 mr-2" />
          LOGOUT
        </Button>
      </div>
    );
  }

  // If connecting, show connecting state
  if (isConnecting) {
    return (
      <div className="flex items-center space-x-4">
        <Button
          className="bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
          disabled
        >
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          CONNECTING...
        </Button>
        {connectionError && (
          <div className="flex items-center space-x-2 bg-red-100 border-4 border-red-500 px-3 py-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-bold font-mono text-red-500">
              {connectionError}
            </span>
          </div>
        )}
        {connectionAttempts > 1 && (
          <Button
            onClick={handleRetry}
            variant="outline"
            className="bg-white border-4 border-black text-black hover:bg-gray-100 font-black font-mono px-4 py-2 shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
          >
            RETRY
          </Button>
        )}
      </div>
    );
  }

  // If not authenticated, show connect wallet button
  return (
    <Button
      onClick={handleWalletConnection}
      className="bg-black hover:bg-[#2d3748] text-white font-black font-mono px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
    >
      <Wallet className="w-4 h-4 mr-2" />
      CONNECT WALLET
    </Button>
  );
} 