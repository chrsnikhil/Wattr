import { useState, useCallback, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserRole } from '@/hooks/use-user-role';

interface WalletTokenOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  transactionId?: string;
  explorerUrl?: string;
  mockMode?: boolean;
  newBalance?: number;
  message?: string;
}

interface WalletTokenInfo {
  tokenId: string;
  walletAddress: string;
  userRole: string;
  balance: number;
  canMint: boolean;
  canBurn: boolean;
  mockMode?: boolean;
}

export function useWalletTokens() {
  const { authenticated, user } = usePrivy();
  const { userProfile, hasPermission } = useUserRole();

  const [tokenInfo, setTokenInfo] = useState<WalletTokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastOperation, setLastOperation] =
    useState<WalletTokenOperationResult | null>(null);

  const walletAddress = user?.wallet?.address || '';
  const userRole = userProfile?.role || 'viewer';
  const canMintTokens = hasPermission('mint', 'tokens'); // Use specific token permissions
  const canBurnTokens = hasPermission('burn', 'tokens'); // Use specific token permissions

  // Fetch wallet token information
  const fetchTokenInfo =
    useCallback(async (): Promise<WalletTokenOperationResult> => {
      if (!authenticated || !walletAddress) {
        return {
          success: false,
          error: 'Wallet not connected',
        };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/wallet-tokens?walletAddress=${encodeURIComponent(walletAddress)}&userRole=${encodeURIComponent(userRole)}`,
        );

        const result = await response.json();

        if (result.success) {
          setTokenInfo({
            tokenId: result.tokenId,
            walletAddress: result.walletAddress,
            userRole: result.userRole,
            balance: result.balance,
            canMint: result.canMint,
            canBurn: result.canBurn,
            mockMode: result.mockMode,
          });

          return {
            success: true,
            data: result,
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
          err instanceof Error ? err.message : 'Failed to fetch token info';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    }, [authenticated, walletAddress, userRole]);

  // Mint tokens to the connected wallet
  const mintTokens = useCallback(
    async (
      amount: number,
      memo: string = 'Energy production tokens',
    ): Promise<WalletTokenOperationResult> => {
      if (!authenticated || !walletAddress) {
        return {
          success: false,
          error: 'Wallet not connected',
        };
      }

      if (!canMintTokens) {
        return {
          success: false,
          error: 'Unauthorized: Only prosumers can mint tokens',
        };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/wallet-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'mint',
            walletAddress,
            amount,
            memo,
            userRole,
          }),
        });

        const result = await response.json();
        setLastOperation(result);

        if (result.success) {
          // Update local token info with new balance
          if (tokenInfo && result.newBalance !== undefined) {
            setTokenInfo(prev =>
              prev ? { ...prev, balance: result.newBalance } : null,
            );
          }

          return {
            success: true,
            data: result,
            transactionId: result.transactionId,
            explorerUrl: result.explorerUrl,
            mockMode: result.mockMode,
            newBalance: result.newBalance,
            message: result.message,
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
    [authenticated, walletAddress, userRole, canMintTokens, tokenInfo],
  );

  // Burn tokens from the connected wallet
  const burnTokens = useCallback(
    async (
      amount: number,
      memo: string = 'Energy consumption tokens',
    ): Promise<WalletTokenOperationResult> => {
      if (!authenticated || !walletAddress) {
        return {
          success: false,
          error: 'Wallet not connected',
        };
      }

      if (!canBurnTokens) {
        return {
          success: false,
          error: 'Unauthorized: Only prosumers can burn tokens',
        };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/wallet-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'burn',
            walletAddress,
            amount,
            memo,
            userRole,
          }),
        });

        const result = await response.json();
        setLastOperation(result);

        if (result.success) {
          // Update local token info with new balance
          if (tokenInfo && result.newBalance !== undefined) {
            setTokenInfo(prev =>
              prev ? { ...prev, balance: result.newBalance } : null,
            );
          }

          return {
            success: true,
            data: result,
            transactionId: result.transactionId,
            explorerUrl: result.explorerUrl,
            mockMode: result.mockMode,
            newBalance: result.newBalance,
            message: result.message,
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
    [authenticated, walletAddress, userRole, canBurnTokens, tokenInfo],
  );

  // Associate token with wallet (one-time setup)
  const associateToken =
    useCallback(async (): Promise<WalletTokenOperationResult> => {
      if (!authenticated || !walletAddress) {
        return {
          success: false,
          error: 'Wallet not connected',
        };
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/wallet-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'associate',
            walletAddress,
            userRole,
          }),
        });

        const result = await response.json();
        setLastOperation(result);

        if (result.success) {
          // Refresh token info after association
          await fetchTokenInfo();

          return {
            success: true,
            data: result,
            transactionId: result.transactionId,
            explorerUrl: result.explorerUrl,
            mockMode: result.mockMode,
            message: result.message,
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
    }, [authenticated, walletAddress, userRole, fetchTokenInfo]);

  // Auto-fetch token info when wallet connects
  useEffect(() => {
    if (authenticated && walletAddress && userRole) {
      fetchTokenInfo();
    }
  }, [authenticated, walletAddress, userRole, fetchTokenInfo]);

  return {
    // State
    tokenInfo,
    loading,
    error,
    lastOperation,

    // Computed values
    walletAddress,
    userRole,
    canMintTokens,
    canBurnTokens,
    isConnected: authenticated && !!walletAddress,

    // Actions
    fetchTokenInfo,
    mintTokens,
    burnTokens,
    associateToken,

    // Clear error
    clearError: () => setError(null),
  };
}
