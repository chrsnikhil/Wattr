import { useState, useCallback } from 'react';
import type {
  EnergyToken,
  TokenTransfer,
  TokenBalance,
} from '@/lib/hedera-token-service';

interface UseEnergyTokensOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface TokenOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  transactionId?: string;
  explorerUrl?: string;
  mockMode?: boolean;
}

export function useEnergyTokens(options: UseEnergyTokensOptions = {}) {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  const [currentToken, setCurrentToken] = useState<EnergyToken | null>(null);
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [recentTransfers, setRecentTransfers] = useState<TokenTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new energy credit token
  const createToken = useCallback(
    async (
      tokenName: string = 'WattrEnergyCredit',
      tokenSymbol: string = 'WEC',
      decimals: number = 2,
      initialSupply: number = 1000000,
    ): Promise<TokenOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create',
            tokenName,
            tokenSymbol,
            decimals,
            initialSupply,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setCurrentToken(result.token);
          return {
            success: true,
            data: result.token,
            transactionId: result.transactionId,
            explorerUrl: result.explorerUrl,
            mockMode: result.mockMode,
          };
        } else {
          setError(result.error);
          return {
            success: false,
            error: result.error,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create token';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Mint new energy tokens (when renewable energy is produced)
  const mintTokens = useCallback(
    async (
      tokenId: string,
      amount: number,
      memo: string = 'Renewable energy production',
    ): Promise<TokenOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'mint',
            tokenId,
            amount,
            memo,
          }),
        });

        const result = await response.json();

        if (result.success) {
          return {
            success: true,
            data: result,
            transactionId: result.transactionId,
            explorerUrl: result.explorerUrl,
            mockMode: result.mockMode,
          };
        } else {
          setError(result.error);
          return {
            success: false,
            error: result.error,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to mint tokens';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Transfer energy tokens between accounts
  const transferTokens = useCallback(
    async (
      tokenId: string,
      fromAccountId: string,
      toAccountId: string,
      amount: number,
      memo: string = 'Energy credit transfer',
    ): Promise<TokenOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'transfer',
            tokenId,
            fromAccountId,
            toAccountId,
            amount,
            memo,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Add to recent transfers
          setRecentTransfers(prev => [result.transfer, ...prev.slice(0, 9)]);

          return {
            success: true,
            data: result.transfer,
            transactionId: result.transfer?.transactionId,
            explorerUrl: result.explorerUrl,
            mockMode: result.mockMode,
          };
        } else {
          setError(result.error);
          return {
            success: false,
            error: result.error,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to transfer tokens';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Get token balance for an account
  const getBalance = useCallback(
    async (
      accountId: string,
      tokenId: string,
    ): Promise<TokenOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'balance',
            accountId,
            tokenId,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setTokenBalance(result.balance);
          return {
            success: true,
            data: result.balance,
            mockMode: result.mockMode,
          };
        } else {
          setError(result.error);
          return {
            success: false,
            error: result.error,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get balance';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Associate token with account (required before receiving tokens)
  const associateToken = useCallback(
    async (
      accountId: string,
      tokenId: string,
      privateKey?: string,
    ): Promise<TokenOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'associate',
            accountId,
            tokenId,
            privateKey,
          }),
        });

        const result = await response.json();

        if (result.success) {
          return {
            success: true,
            data: result,
            transactionId: result.transactionId,
            mockMode: result.mockMode,
          };
        } else {
          setError(result.error);
          return {
            success: false,
            error: result.error,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to associate token';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Burn tokens (when energy is consumed)
  const burnTokens = useCallback(
    async (
      tokenId: string,
      amount: number,
      memo: string = 'Energy consumption',
    ): Promise<TokenOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'burn',
            tokenId,
            amount,
            memo,
          }),
        });

        const result = await response.json();

        if (result.success) {
          return {
            success: true,
            data: result,
            transactionId: result.transactionId,
            explorerUrl: result.explorerUrl,
            mockMode: result.mockMode,
          };
        } else {
          setError(result.error);
          return {
            success: false,
            error: result.error,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to burn tokens';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Get current token info
  const getTokenInfo = useCallback(async (): Promise<TokenOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tokens');
      const result = await response.json();

      if (result.success && result.token) {
        setCurrentToken(result.token);
      }

      return {
        success: result.success,
        data: result.token,
        mockMode: result.mockMode,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get token info';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions
  const formatTokenAmount = useCallback(
    (amount: number, decimals: number = 2): string => {
      return `${amount.toFixed(decimals)} kWh`;
    },
    [],
  );

  const generateExplorerUrl = useCallback(
    (transactionId: string, isTestnet: boolean = true): string => {
      const network = isTestnet ? 'testnet' : 'mainnet';
      return `https://hashscan.io/${network}/transaction/${transactionId}`;
    },
    [],
  );

  const isValidAccountId = useCallback((accountId: string): boolean => {
    return /^0\.0\.\d+$/.test(accountId);
  }, []);

  return {
    // State
    currentToken,
    tokenBalance,
    recentTransfers,
    loading,
    error,

    // Operations
    createToken,
    mintTokens,
    transferTokens,
    getBalance,
    associateToken,
    burnTokens,
    getTokenInfo,

    // Helpers
    formatTokenAmount,
    generateExplorerUrl,
    isValidAccountId,

    // Computed values
    hasToken: !!currentToken,
    tokenId: currentToken?.tokenId,
    tokenSymbol: currentToken?.symbol || 'WEC',
    tokenName: currentToken?.name || 'WattrEnergyCredit',
  };
}
