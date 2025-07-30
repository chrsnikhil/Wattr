'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWalletTokens } from '@/hooks/use-wallet-tokens';
import {
  Coins,
  Plus,
  Minus,
  Wallet,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Crown,
  Eye,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface WalletTokenManagerProps {
  className?: string;
}

export default function WalletTokenManager({
  className = '',
}: WalletTokenManagerProps) {
  const {
    tokenInfo,
    loading,
    error,
    lastOperation,
    walletAddress,
    userRole,
    canMintTokens,
    canBurnTokens,
    isConnected,
    fetchTokenInfo,
    mintTokens,
    burnTokens,
    associateToken,
    clearError,
  } = useWalletTokens();

  const [mintAmount, setMintAmount] = useState<string>('10');
  const [burnAmount, setBurnAmount] = useState<string>('5');
  const [mintMemo, setMintMemo] = useState<string>('Solar energy production');
  const [burnMemo, setBurnMemo] = useState<string>('Home energy consumption');
  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  // Handle mint tokens
  const handleMint = async () => {
    const amount = parseFloat(mintAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    setOperationLoading('mint');
    try {
      const result = await mintTokens(amount, mintMemo);
      if (result.success) {
        setMintAmount('10'); // Reset form
        setMintMemo('Solar energy production');
      }
    } finally {
      setOperationLoading(null);
    }
  };

  // Handle burn tokens
  const handleBurn = async () => {
    const amount = parseFloat(burnAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    setOperationLoading('burn');
    try {
      const result = await burnTokens(amount, burnMemo);
      if (result.success) {
        setBurnAmount('5'); // Reset form
        setBurnMemo('Home energy consumption');
      }
    } finally {
      setOperationLoading(null);
    }
  };

  // Handle token association
  const handleAssociate = async () => {
    setOperationLoading('associate');
    try {
      await associateToken();
    } finally {
      setOperationLoading(null);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setOperationLoading('refresh');
    try {
      await fetchTokenInfo();
    } finally {
      setOperationLoading(null);
    }
  };

  if (!isConnected) {
    return (
      <Card
        className={`bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] ${className}`}
      >
        <CardContent className="p-8 text-center">
          <Wallet className="h-16 w-16 text-[#4a5568] mx-auto mb-4" />
          <h3 className="text-xl font-black font-mono text-black mb-2">
            WALLET NOT CONNECTED
          </h3>
          <p className="text-sm font-bold font-mono text-[#4a5568]">
            Connect your wallet to manage energy tokens
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRoleIcon = () => {
    return userRole === 'prosumer' ? (
      <Crown className="h-5 w-5 text-[#10b981]" />
    ) : (
      <Eye className="h-5 w-5 text-blue-500" />
    );
  };

  const getRoleBadgeColor = () => {
    return userRole === 'prosumer' ? 'bg-[#10b981]' : 'bg-blue-500';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Wallet Info Card */}
      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-black font-mono text-black">
            <div className="w-8 h-8 bg-[#10b981] border-2 border-black flex items-center justify-center mr-3">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            CONNECTED WALLET
            <div className="ml-auto flex items-center gap-2">
              {getRoleIcon()}
              <Badge
                className={`${getRoleBadgeColor()} text-white border-2 border-black font-black font-mono text-xs`}
              >
                {userRole?.toUpperCase()}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-black font-mono text-black">
                WALLET ADDRESS:
              </Label>
              <p className="text-xs font-mono text-[#4a5568] break-all bg-[#f5f5f5] p-2 border-2 border-black">
                {walletAddress}
              </p>
            </div>
            <div>
              <Label className="text-sm font-black font-mono text-black">
                WEC TOKEN BALANCE:
              </Label>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-[#10b981]" />
                <span className="text-lg font-black font-mono text-black">
                  {loading
                    ? 'LOADING...'
                    : `${tokenInfo?.balance?.toFixed(2) || '0.00'} WEC`}
                </span>
                <Button
                  onClick={handleRefresh}
                  disabled={operationLoading === 'refresh'}
                  size="sm"
                  variant="outline"
                  className="border-2 border-black bg-white hover:bg-[#f5f5f5] font-black font-mono"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${operationLoading === 'refresh' ? 'animate-spin' : ''}`}
                  />
                </Button>
              </div>
            </div>
          </div>

          {tokenInfo?.mockMode && (
            <Alert className="bg-blue-100 border-4 border-blue-500">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="font-bold font-mono text-blue-800">
                DEMO MODE: Token operations are simulated for demonstration
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Token Operations */}
      {userRole === 'prosumer' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mint Tokens */}
          <Card className="bg-white border-4 border-[#10b981] shadow-[8px_8px_0px_0px_#4a5568]">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-black font-mono text-black">
                <div className="w-6 h-6 bg-[#10b981] border-2 border-black flex items-center justify-center mr-3">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                MINT TOKENS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-black font-mono text-black">
                  AMOUNT (WEC):
                </Label>
                <Input
                  type="number"
                  value={mintAmount}
                  onChange={e => setMintAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="font-mono border-2 border-black"
                  placeholder="10.00"
                />
              </div>
              <div>
                <Label className="text-sm font-black font-mono text-black">
                  MEMO:
                </Label>
                <Input
                  value={mintMemo}
                  onChange={e => setMintMemo(e.target.value)}
                  className="font-mono border-2 border-black"
                  placeholder="Solar energy production"
                />
              </div>
              <Button
                onClick={handleMint}
                disabled={operationLoading === 'mint' || !canMintTokens}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono border-4 border-black shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
              >
                {operationLoading === 'mint' ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    MINTING TOKENS...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    MINT {mintAmount} WEC
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Burn Tokens */}
          <Card className="bg-white border-4 border-red-500 shadow-[8px_8px_0px_0px_#4a5568]">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-black font-mono text-black">
                <div className="w-6 h-6 bg-red-500 border-2 border-black flex items-center justify-center mr-3">
                  <Minus className="h-4 w-4 text-white" />
                </div>
                BURN TOKENS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-black font-mono text-black">
                  AMOUNT (WEC):
                </Label>
                <Input
                  type="number"
                  value={burnAmount}
                  onChange={e => setBurnAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  max={tokenInfo?.balance || 0}
                  className="font-mono border-2 border-black"
                  placeholder="5.00"
                />
              </div>
              <div>
                <Label className="text-sm font-black font-mono text-black">
                  MEMO:
                </Label>
                <Input
                  value={burnMemo}
                  onChange={e => setBurnMemo(e.target.value)}
                  className="font-mono border-2 border-black"
                  placeholder="Home energy consumption"
                />
              </div>
              <Button
                onClick={handleBurn}
                disabled={operationLoading === 'burn' || !canBurnTokens}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black font-mono border-4 border-black shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
              >
                {operationLoading === 'burn' ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    BURNING TOKENS...
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 mr-2" />
                    BURN {burnAmount} WEC
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Viewer role - read-only
        <Card className="bg-blue-100 border-4 border-blue-500 shadow-[8px_8px_0px_0px_#4a5568]">
          <CardContent className="p-8 text-center">
            <Eye className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-black font-mono text-black mb-2">
              VIEWER MODE
            </h3>
            <p className="text-sm font-bold font-mono text-blue-600 mb-4">
              Upgrade to prosumer role to mint and burn energy tokens
            </p>
            <Badge className="bg-blue-500 text-white border-2 border-black font-black font-mono">
              READ-ONLY ACCESS
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="bg-red-100 border-4 border-red-500">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="font-bold font-mono text-red-800">
            ERROR: {error}
            <Button
              onClick={clearError}
              size="sm"
              variant="link"
              className="ml-2 text-red-600 underline font-black font-mono"
            >
              DISMISS
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Last Operation Result */}
      {lastOperation && lastOperation.success && (
        <Alert className="bg-[#10b981] bg-opacity-10 border-4 border-[#10b981]">
          <CheckCircle className="h-4 w-4 text-[#10b981]" />
          <AlertDescription className="font-bold font-mono text-[#10b981]">
            SUCCESS: {lastOperation.message}
            {lastOperation.explorerUrl && (
              <Button
                onClick={() => window.open(lastOperation.explorerUrl, '_blank')}
                size="sm"
                variant="link"
                className="ml-2 text-[#10b981] underline font-black font-mono"
              >
                VIEW ON EXPLORER
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
