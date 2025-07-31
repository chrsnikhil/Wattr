'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useHashPack } from './hashpack-provider';
import { Wallet, LogOut } from 'lucide-react';

export default function ConnectWalletButton() {
  const { isConnected, accountId, connect, disconnect, isLoading } = useHashPack();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('ConnectWalletButton: Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (isLoading) {
    return (
      <Button
        variant="outline"
        className="border-2 border-black shadow-[2px_2px_0px_0px_#4a5568] hover:shadow-[1px_1px_0px_0px_#4a5568] transition-all"
        disabled
      >
        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
        CONNECTING...
      </Button>
    );
  }

  if (isConnected && accountId) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="border-2 border-black shadow-[2px_2px_0px_0px_#4a5568] hover:shadow-[1px_1px_0px_0px_#4a5568] transition-all bg-[#10b981] text-white hover:bg-[#059669]"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {accountId.slice(0, 8)}...{accountId.slice(-4)}
        </Button>
        <Button
          variant="outline"
          onClick={handleDisconnect}
          className="border-2 border-black shadow-[2px_2px_0px_0px_#4a5568] hover:shadow-[1px_1px_0px_0px_#4a5568] transition-all"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      variant="outline"
      className="border-2 border-black shadow-[2px_2px_0px_0px_#4a5568] hover:shadow-[1px_1px_0px_0px_#4a5568] transition-all bg-black text-white hover:bg-[#2d3748]"
    >
      <Wallet className="w-4 h-4 mr-2" />
      CONNECT HASHPACK
    </Button>
  );
} 