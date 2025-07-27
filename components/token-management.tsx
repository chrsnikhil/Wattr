'use client';

import { useState, useEffect } from 'react';
import { useEnergyTokens } from '@/hooks/use-energy-tokens';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Coins,
  Zap,
  Send,
  Plus,
  Minus,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Flame,
} from 'lucide-react';

export default function TokenManagement() {
  const {
    currentToken,
    tokenBalance,
    recentTransfers,
    loading,
    error,
    createToken,
    mintTokens,
    transferTokens,
    getBalance,
    burnTokens,
    getTokenInfo,
    formatTokenAmount,
    generateExplorerUrl,
    isValidAccountId,
    hasToken,
    tokenId,
    tokenSymbol,
    tokenName,
  } = useEnergyTokens();

  // Form states
  const [createForm, setCreateForm] = useState({
    tokenName: 'WattrEnergyCredit',
    tokenSymbol: 'WEC',
    decimals: 2,
    initialSupply: 1000000,
  });

  const [mintForm, setMintForm] = useState({
    amount: 100,
    memo: 'Renewable energy production',
  });

  const [transferForm, setTransferForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 10,
    memo: 'Energy credit transfer',
  });

  const [balanceForm, setBalanceForm] = useState({
    accountId: '',
  });

  const [burnForm, setBurnForm] = useState({
    amount: 10,
    memo: 'Energy consumption',
  });

  const [lastOperation, setLastOperation] = useState<any>(null);

  // Load token info on mount
  useEffect(() => {
    getTokenInfo();
  }, [getTokenInfo]);

  const handleCreateToken = async () => {
    const result = await createToken(
      createForm.tokenName,
      createForm.tokenSymbol,
      createForm.decimals,
      createForm.initialSupply,
    );
    setLastOperation(result);
  };

  const handleMintTokens = async () => {
    if (!tokenId) return;
    const result = await mintTokens(tokenId, mintForm.amount, mintForm.memo);
    setLastOperation(result);
  };

  const handleTransferTokens = async () => {
    if (!tokenId) return;
    const result = await transferTokens(
      tokenId,
      transferForm.fromAccountId,
      transferForm.toAccountId,
      transferForm.amount,
      transferForm.memo,
    );
    setLastOperation(result);
  };

  const handleGetBalance = async () => {
    if (!tokenId) return;
    const result = await getBalance(balanceForm.accountId, tokenId);
    setLastOperation(result);
  };

  const handleBurnTokens = async () => {
    if (!tokenId) return;
    const result = await burnTokens(tokenId, burnForm.amount, burnForm.memo);
    setLastOperation(result);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-6xl font-black font-mono text-black tracking-wider mb-4">
          ENERGY TOKEN MANAGEMENT
        </h1>
        <p className="text-xl font-bold font-mono text-black">
          HEDERA TOKEN SERVICE FOR RENEWABLE ENERGY CREDITS
        </p>
      </div>

      {/* Current Token Status */}
      {hasToken ? (
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-black font-mono text-black">
              <div className="w-8 h-8 bg-[#10b981] border-2 border-black flex items-center justify-center mr-4">
                <Coins className="h-5 w-5 text-white" />
              </div>
              CURRENT TOKEN
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label className="font-black font-mono text-black">
                  TOKEN NAME
                </Label>
                <p className="text-xl font-black font-mono text-[#10b981]">
                  {tokenName}
                </p>
              </div>
              <div>
                <Label className="font-black font-mono text-black">
                  SYMBOL
                </Label>
                <p className="text-xl font-black font-mono text-[#10b981]">
                  {tokenSymbol}
                </p>
              </div>
              <div>
                <Label className="font-black font-mono text-black">
                  TOKEN ID
                </Label>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-black font-mono text-black bg-gray-100 px-2 py-1 border-2 border-black">
                    {tokenId}
                  </p>
                  <Button
                    size="sm"
                    className="bg-black text-white font-black font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]"
                    onClick={() =>
                      window.open(generateExplorerUrl(tokenId!), '_blank')
                    }
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-300 border-4 border-black mx-auto mb-4 flex items-center justify-center">
              <Coins className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-2xl font-black font-mono text-black mb-2">
              NO TOKEN CREATED YET
            </h3>
            <p className="font-bold text-black">
              Create your first energy credit token to get started
            </p>
          </CardContent>
        </Card>
      )}

      {/* Last Operation Result */}
      {lastOperation && (
        <Card
          className={`border-4 shadow-[8px_8px_0px_0px_#4a5568] ${
            lastOperation.success
              ? 'bg-green-50 border-[#10b981]'
              : 'bg-red-50 border-black'
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-black font-mono text-black">
              {lastOperation.success ? (
                <CheckCircle className="h-5 w-5 text-[#10b981] mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              {lastOperation.success
                ? 'OPERATION SUCCESSFUL'
                : 'OPERATION FAILED'}
              {lastOperation.mockMode && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-2 border-black font-black font-mono">
                  MOCK MODE
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastOperation.success ? (
              <div className="space-y-2">
                {lastOperation.transactionId && (
                  <div className="flex items-center space-x-2">
                    <Label className="font-black font-mono text-black">
                      TRANSACTION ID:
                    </Label>
                    <p className="font-mono text-sm text-black bg-gray-100 px-2 py-1 border border-black">
                      {lastOperation.transactionId}
                    </p>
                    {lastOperation.explorerUrl && (
                      <Button
                        size="sm"
                        className="bg-[#10b981] text-white font-black font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]"
                        onClick={() =>
                          window.open(lastOperation.explorerUrl, '_blank')
                        }
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        VIEW
                      </Button>
                    )}
                  </div>
                )}
                <pre className="text-xs bg-gray-100 p-3 border-2 border-black font-mono overflow-x-auto">
                  {JSON.stringify(lastOperation.data, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-red-600 font-bold">{lastOperation.error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Operations Tabs */}
      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white border-4 border-black shadow-[4px_4px_0px_0px_#4a5568]">
          <TabsTrigger
            value="create"
            className="font-black font-mono text-black data-[state=active]:bg-[#10b981] data-[state=active]:text-white"
          >
            CREATE
          </TabsTrigger>
          <TabsTrigger
            value="mint"
            className="font-black font-mono text-black data-[state=active]:bg-[#10b981] data-[state=active]:text-white"
          >
            MINT
          </TabsTrigger>
          <TabsTrigger
            value="transfer"
            className="font-black font-mono text-black data-[state=active]:bg-[#10b981] data-[state=active]:text-white"
          >
            TRANSFER
          </TabsTrigger>
          <TabsTrigger
            value="balance"
            className="font-black font-mono text-black data-[state=active]:bg-[#10b981] data-[state=active]:text-white"
          >
            BALANCE
          </TabsTrigger>
          <TabsTrigger
            value="burn"
            className="font-black font-mono text-black data-[state=active]:bg-[#10b981] data-[state=active]:text-white"
          >
            BURN
          </TabsTrigger>
        </TabsList>

        {/* Create Token Tab */}
        <TabsContent value="create">
          <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
            <CardHeader>
              <CardTitle className="text-2xl font-black font-mono text-black">
                CREATE ENERGY TOKEN
              </CardTitle>
              <CardDescription className="font-bold font-mono text-black">
                CREATE A NEW FUNGIBLE TOKEN FOR ENERGY CREDITS (1 TOKEN = 1 kWh)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black font-mono text-black">
                    TOKEN NAME
                  </Label>
                  <Input
                    value={createForm.tokenName}
                    onChange={e =>
                      setCreateForm(prev => ({
                        ...prev,
                        tokenName: e.target.value,
                      }))
                    }
                    className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black font-mono text-black">
                    TOKEN SYMBOL
                  </Label>
                  <Input
                    value={createForm.tokenSymbol}
                    onChange={e =>
                      setCreateForm(prev => ({
                        ...prev,
                        tokenSymbol: e.target.value,
                      }))
                    }
                    className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black font-mono text-black">
                    DECIMALS
                  </Label>
                  <Input
                    type="number"
                    value={createForm.decimals}
                    onChange={e =>
                      setCreateForm(prev => ({
                        ...prev,
                        decimals: parseInt(e.target.value),
                      }))
                    }
                    className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black font-mono text-black">
                    INITIAL SUPPLY
                  </Label>
                  <Input
                    type="number"
                    value={createForm.initialSupply}
                    onChange={e =>
                      setCreateForm(prev => ({
                        ...prev,
                        initialSupply: parseInt(e.target.value),
                      }))
                    }
                    className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateToken}
                disabled={loading}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                {loading ? 'CREATING TOKEN...' : 'CREATE TOKEN'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mint Tokens Tab */}
        <TabsContent value="mint">
          <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
            <CardHeader>
              <CardTitle className="text-2xl font-black font-mono text-black">
                MINT ENERGY TOKENS
              </CardTitle>
              <CardDescription className="font-bold font-mono text-black">
                CREATE NEW TOKENS WHEN RENEWABLE ENERGY IS PRODUCED
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black font-mono text-black">
                    AMOUNT (kWh)
                  </Label>
                  <Input
                    type="number"
                    value={mintForm.amount}
                    onChange={e =>
                      setMintForm(prev => ({
                        ...prev,
                        amount: parseFloat(e.target.value),
                      }))
                    }
                    className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                    disabled={!hasToken}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black font-mono text-black">
                    MEMO
                  </Label>
                  <Input
                    value={mintForm.memo}
                    onChange={e =>
                      setMintForm(prev => ({ ...prev, memo: e.target.value }))
                    }
                    className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                    disabled={!hasToken}
                  />
                </div>
              </div>
              <Button
                onClick={handleMintTokens}
                disabled={loading || !hasToken}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all disabled:opacity-50"
              >
                <Zap className="h-5 w-5 mr-2" />
                {loading ? 'MINTING...' : 'MINT TOKENS'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer Tokens Tab */}
        <TabsContent value="transfer">
          <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
            <CardHeader>
              <CardTitle className="text-2xl font-black font-mono text-black">
                TRANSFER ENERGY TOKENS
              </CardTitle>
              <CardDescription className="font-bold font-mono text-black">
                TRANSFER ENERGY CREDITS BETWEEN ACCOUNTS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black font-mono text-black">
                    FROM ACCOUNT ID
                  </Label>
                  <Input
                    placeholder="0.0.12345"
                    value={transferForm.fromAccountId}
                    onChange={e =>
                      setTransferForm(prev => ({
                        ...prev,
                        fromAccountId: e.target.value,
                      }))
                    }
                    className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                    disabled={!hasToken}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black font-mono text-black">
                    TO ACCOUNT ID
                  </Label>
                  <Input
                    placeholder="0.0.54321"
                    value={transferForm.toAccountId}
                    onChange={e =>
                      setTransferForm(prev => ({
                        ...prev,
                        toAccountId: e.target.value,
                      }))
                    }
                    className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                    disabled={!hasToken}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black font-mono text-black">
                    AMOUNT (kWh)
                  </Label>
                  <Input
                    type="number"
                    value={transferForm.amount}
                    onChange={e =>
                      setTransferForm(prev => ({
                        ...prev,
                        amount: parseFloat(e.target.value),
                      }))
                    }
                    className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                    disabled={!hasToken}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black font-mono text-black">
                    MEMO
                  </Label>
                  <Input
                    value={transferForm.memo}
                    onChange={e =>
                      setTransferForm(prev => ({
                        ...prev,
                        memo: e.target.value,
                      }))
                    }
                    className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                    disabled={!hasToken}
                  />
                </div>
              </div>
              <Button
                onClick={handleTransferTokens}
                disabled={
                  loading ||
                  !hasToken ||
                  !isValidAccountId(transferForm.fromAccountId) ||
                  !isValidAccountId(transferForm.toAccountId)
                }
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all disabled:opacity-50"
              >
                <Send className="h-5 w-5 mr-2" />
                {loading ? 'TRANSFERRING...' : 'TRANSFER TOKENS'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Check Tab */}
        <TabsContent value="balance">
          <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
            <CardHeader>
              <CardTitle className="text-2xl font-black font-mono text-black">
                CHECK TOKEN BALANCE
              </CardTitle>
              <CardDescription className="font-bold font-mono text-black">
                CHECK ENERGY TOKEN BALANCE FOR ANY ACCOUNT
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-black font-mono text-black">
                  ACCOUNT ID
                </Label>
                <Input
                  placeholder="0.0.12345"
                  value={balanceForm.accountId}
                  onChange={e =>
                    setBalanceForm(prev => ({
                      ...prev,
                      accountId: e.target.value,
                    }))
                  }
                  className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                  disabled={!hasToken}
                />
              </div>
              <Button
                onClick={handleGetBalance}
                disabled={
                  loading ||
                  !hasToken ||
                  !isValidAccountId(balanceForm.accountId)
                }
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all disabled:opacity-50"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                {loading ? 'CHECKING...' : 'CHECK BALANCE'}
              </Button>

              {tokenBalance && (
                <Card className="bg-gray-50 border-2 border-black">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-3xl font-black font-mono text-[#10b981]">
                        {formatTokenAmount(tokenBalance.balance)}
                      </p>
                      <p className="text-sm font-bold font-mono text-black">
                        ACCOUNT: {tokenBalance.accountId}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Burn Tokens Tab */}
        <TabsContent value="burn">
          <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
            <CardHeader>
              <CardTitle className="text-2xl font-black font-mono text-black">
                BURN ENERGY TOKENS
              </CardTitle>
              <CardDescription className="font-bold font-mono text-black">
                BURN TOKENS WHEN ENERGY IS CONSUMED
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black font-mono text-black">
                    AMOUNT (kWh)
                  </Label>
                  <Input
                    type="number"
                    value={burnForm.amount}
                    onChange={e =>
                      setBurnForm(prev => ({
                        ...prev,
                        amount: parseFloat(e.target.value),
                      }))
                    }
                    className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                    disabled={!hasToken}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-black font-mono text-black">
                    MEMO
                  </Label>
                  <Input
                    value={burnForm.memo}
                    onChange={e =>
                      setBurnForm(prev => ({ ...prev, memo: e.target.value }))
                    }
                    className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568]"
                    disabled={!hasToken}
                  />
                </div>
              </div>
              <Button
                onClick={handleBurnTokens}
                disabled={loading || !hasToken}
                className="w-full bg-black hover:bg-gray-800 text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all disabled:opacity-50"
              >
                <Flame className="h-5 w-5 mr-2" />
                {loading ? 'BURNING...' : 'BURN TOKENS'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Transfers */}
      {recentTransfers.length > 0 && (
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-black">
              RECENT TRANSFERS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransfers.map((transfer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 border-2 border-black"
                >
                  <div>
                    <p className="font-black font-mono text-black">
                      {formatTokenAmount(transfer.amount)} →{' '}
                      {transfer.toAccountId}
                    </p>
                    <p className="text-sm font-mono text-gray-600">
                      {transfer.timestamp &&
                        new Date(transfer.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {transfer.transactionId && (
                    <Button
                      size="sm"
                      className="bg-[#10b981] text-white font-black font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]"
                      onClick={() =>
                        window.open(
                          generateExplorerUrl(transfer.transactionId!),
                          '_blank',
                        )
                      }
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-4 border-red-500 shadow-[8px_8px_0px_0px_#4a5568]">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-bold text-red-600">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
