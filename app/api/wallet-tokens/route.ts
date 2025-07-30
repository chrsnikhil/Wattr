import { NextRequest, NextResponse } from 'next/server';
import {
  getHederaTokenService,
  mockEnergyToken,
} from '@/lib/hedera-token-service';
import {
  getHederaAccountId,
  createHederaAccountForWallet,
  associateTokenWithWallet,
  getWalletPrivateKey,
  isWalletMapped,
} from '@/lib/redis-wallet-mappings';

// Environment check for mock mode
const MOCK_MODE =
  process.env.HEDERA_MOCK_MODE === 'true' ||
  !process.env.HEDERA_PRIVATE_KEY ||
  !process.env.HEDERA_ACCOUNT_ID ||
  !process.env.WEC_TOKEN_ID;

// Log the current mode on startup
console.log('🔧 Hedera Configuration Status:');
console.log(`   Mock Mode: ${MOCK_MODE}`);
console.log(
  `   Account ID: ${process.env.HEDERA_ACCOUNT_ID ? 'Set' : 'Missing'}`,
);
console.log(
  `   Private Key: ${process.env.HEDERA_PRIVATE_KEY ? 'Set' : 'Missing'}`,
);
console.log(`   Token ID: ${process.env.WEC_TOKEN_ID ? 'Set' : 'Missing'}`);
if (!MOCK_MODE) {
  console.log('🚀 Real Hedera operations enabled!');
} else {
  console.log(
    '🧪 Mock mode active - set environment variables for real operations',
  );
}

// Helper function to ensure user has a Hedera account
async function ensureHederaAccount(
  walletAddress: string,
): Promise<string | null> {
  const existingAccountId = await getHederaAccountId(walletAddress);
  if (existingAccountId) {
    console.log(
      `✅ Found existing Hedera account ${existingAccountId} for wallet ${walletAddress}`,
    );
    return existingAccountId;
  }

  // Create a new Hedera account for this wallet
  try {
    console.log(`🔄 Creating new Hedera account for wallet: ${walletAddress}`);
    const newAccountId = await createHederaAccountForWallet(walletAddress);

    // Automatically associate the WEC token with the new account
    const tokenId = process.env.WEC_TOKEN_ID || mockEnergyToken.tokenId;
    try {
      await associateTokenWithWallet(walletAddress, tokenId);
      console.log(`✅ Associated WEC token with new account ${newAccountId}`);
    } catch (associateError) {
      console.warn(
        `⚠️ Failed to associate token with new account: ${associateError}`,
      );
      // Continue anyway - association can be done later
    }

    return newAccountId;
  } catch (error) {
    console.error(
      `❌ Failed to create Hedera account for wallet ${walletAddress}:`,
      error,
    );
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, walletAddress, amount, memo, userRole } = body;

    // Handle setup actions that don't require prosumer role
    if (action === 'create-account') {
      if (!walletAddress) {
        return NextResponse.json(
          {
            success: false,
            error: 'Wallet address is required',
          },
          { status: 400 },
        );
      }

      try {
        const accountId = await createHederaAccountForWallet(walletAddress);
        return NextResponse.json({
          success: true,
          action: 'create-account',
          accountId,
          walletAddress,
          message: 'Hedera account created successfully',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error creating account:', error);
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create account',
          },
          { status: 500 },
        );
      }
    }

    if (action === 'associate-token') {
      if (!walletAddress) {
        return NextResponse.json(
          {
            success: false,
            error: 'Wallet address is required',
          },
          { status: 400 },
        );
      }

      try {
        const tokenId = process.env.WEC_TOKEN_ID || mockEnergyToken.tokenId;
        const transactionId = await associateTokenWithWallet(
          walletAddress,
          tokenId,
        );
        return NextResponse.json({
          success: true,
          action: 'associate-token',
          transactionId,
          tokenId,
          walletAddress,
          message: 'Token associated successfully',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error associating token:', error);
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to associate token',
          },
          { status: 500 },
        );
      }
    }

    // Only allow prosumers to mint/burn tokens
    if (userRole !== 'prosumer') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Only prosumers can mint/burn tokens',
          message: 'Please upgrade to prosumer role to access token operations',
          requiredRole: 'prosumer',
          currentRole: userRole,
        },
        { status: 403 },
      );
    }

    // Validate required fields
    if (!walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Wallet address is required',
        },
        { status: 400 },
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid amount is required',
        },
        { status: 400 },
      );
    }

    const tokenId = process.env.WEC_TOKEN_ID || mockEnergyToken.tokenId;

    // Try to get or create Hedera account ID for the wallet
    let hederaAccountId: string | null = null;
    try {
      hederaAccountId = await ensureHederaAccount(walletAddress);
    } catch (error) {
      console.warn(`Could not get Hedera account for ${walletAddress}:`, error);
    }

    // Force mock mode if we can't map to Hedera account or if explicitly enabled
    const useMockMode = MOCK_MODE || !hederaAccountId;

    if (useMockMode) {
      console.log(
        `Mock mode: ${action} ${amount} tokens for wallet ${walletAddress}`,
      );

      // Return mock responses that simulate real Hedera operations
      switch (action) {
        case 'mint':
          return NextResponse.json({
            success: true,
            mockMode: true,
            action: 'mint',
            tokenId,
            walletAddress,
            amount,
            transactionId: `mock-mint-${Date.now()}`,
            explorerUrl: `https://hashscan.io/testnet/transaction/mock-mint-${Date.now()}`,
            message: `Successfully minted ${amount} WEC tokens to ${walletAddress}`,
            newBalance: amount, // In mock mode, just return the minted amount
            memo: memo || 'Energy production tokens',
            timestamp: new Date().toISOString(),
            note: 'This is a simulation. Real tokens require Hedera account mapping.',
          });

        case 'burn':
          return NextResponse.json({
            success: true,
            mockMode: true,
            action: 'burn',
            tokenId,
            walletAddress,
            amount,
            transactionId: `mock-burn-${Date.now()}`,
            explorerUrl: `https://hashscan.io/testnet/transaction/mock-burn-${Date.now()}`,
            message: `Successfully burned ${amount} WEC tokens from ${walletAddress}`,
            newBalance: 0, // In mock mode, return 0 after burning
            memo: memo || 'Energy consumption tokens',
            timestamp: new Date().toISOString(),
            note: 'This is a simulation. Real tokens require Hedera account mapping.',
          });

        case 'balance':
          return NextResponse.json({
            success: true,
            mockMode: true,
            action: 'balance',
            tokenId,
            walletAddress,
            balance: 0, // In mock mode without tracking, return 0
            timestamp: new Date().toISOString(),
            note: 'This is a simulation. Real balance requires Hedera account mapping.',
          });

        case 'associate':
          return NextResponse.json({
            success: true,
            mockMode: true,
            action: 'associate',
            tokenId,
            walletAddress,
            transactionId: `mock-associate-${Date.now()}`,
            explorerUrl: `https://hashscan.io/testnet/transaction/mock-associate-${Date.now()}`,
            message: `Successfully associated WEC token with ${walletAddress}`,
            timestamp: new Date().toISOString(),
            note: 'This is a simulation. Real association requires Hedera account mapping.',
          });

        default:
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid action specified',
              availableActions: ['mint', 'burn', 'balance', 'associate'],
            },
            { status: 400 },
          );
      }
    }

    // Real Hedera implementation with valid account ID
    const hederaService = getHederaTokenService();

    // Ensure we have a valid account ID before proceeding
    if (!hederaAccountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to map wallet address to Hedera account ID',
          walletAddress,
          message: 'Please try again or contact support if this issue persists',
        },
        { status: 400 },
      );
    }

    const accountId = hederaAccountId; // Now TypeScript knows it's not null

    switch (action) {
      case 'mint':
        try {
          const transactionId = await hederaService.mintEnergyTokensToAccount(
            tokenId,
            accountId,
            amount,
            memo || 'Prosumer energy production',
          );

          // After minting, get new balance
          const balance = await hederaService.getTokenBalance(
            accountId,
            tokenId,
          );

          return NextResponse.json({
            success: true,
            mockMode: false,
            action: 'mint',
            tokenId,
            walletAddress,
            accountId,
            amount,
            transactionId,
            explorerUrl: `https://hashscan.io/testnet/transaction/${transactionId}`,
            message: `Successfully minted ${amount} WEC tokens to your account`,
            newBalance: balance.balance,
            memo: memo || 'Prosumer energy production',
            timestamp: new Date().toISOString(),
          });
        } catch (error: any) {
          return NextResponse.json(
            {
              success: false,
              error: `Failed to mint tokens: ${error.message}`,
              action: 'mint',
              walletAddress,
              amount,
            },
            { status: 500 },
          );
        }

      case 'burn':
        try {
          // Get the user's private key for signing the transfer
          const userPrivateKey = await getWalletPrivateKey(walletAddress);
          if (!userPrivateKey) {
            throw new Error('No private key found for wallet account');
          }

          const transactionId = await hederaService.burnEnergyTokensFromAccount(
            tokenId,
            accountId,
            userPrivateKey,
            amount,
            memo || 'Prosumer energy consumption',
          );

          // After burning, get new balance
          const balance = await hederaService.getTokenBalance(
            accountId,
            tokenId,
          );

          return NextResponse.json({
            success: true,
            mockMode: false,
            action: 'burn',
            tokenId,
            walletAddress,
            accountId,
            amount,
            transactionId,
            explorerUrl: `https://hashscan.io/testnet/transaction/${transactionId}`,
            message: `Successfully burned ${amount} WEC tokens from your account`,
            newBalance: balance.balance,
            memo: memo || 'Prosumer energy consumption',
            timestamp: new Date().toISOString(),
          });
        } catch (error: any) {
          return NextResponse.json(
            {
              success: false,
              error: `Failed to burn tokens: ${error.message}`,
              action: 'burn',
              walletAddress,
              amount,
            },
            { status: 500 },
          );
        }

      case 'balance':
        try {
          const balance = await hederaService.getTokenBalance(
            accountId,
            tokenId,
          );

          return NextResponse.json({
            success: true,
            mockMode: false,
            action: 'balance',
            tokenId,
            walletAddress,
            accountId,
            balance: balance.balance,
            explorerUrl: `https://hashscan.io/testnet/account/${accountId}`,
            timestamp: new Date().toISOString(),
          });
        } catch (error: any) {
          return NextResponse.json(
            {
              success: false,
              error: `Failed to get balance: ${error.message}`,
              action: 'balance',
              walletAddress,
            },
            { status: 500 },
          );
        }

      case 'associate':
        try {
          const transactionId = await hederaService.associateToken(
            accountId,
            tokenId,
          );

          return NextResponse.json({
            success: true,
            mockMode: false,
            action: 'associate',
            tokenId,
            walletAddress,
            accountId,
            transactionId,
            explorerUrl: `https://hashscan.io/testnet/transaction/${transactionId}`,
            message: `Successfully associated WEC token with wallet`,
            timestamp: new Date().toISOString(),
          });
        } catch (error: any) {
          return NextResponse.json(
            {
              success: false,
              error: `Failed to associate token: ${error.message}`,
              action: 'associate',
              walletAddress,
            },
            { status: 500 },
          );
        }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action specified',
            availableActions: ['mint', 'burn', 'balance', 'associate'],
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Error in wallet-tokens endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const userRole = searchParams.get('userRole');
    const action = searchParams.get('action');

    if (!walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Wallet address is required',
        },
        { status: 400 },
      );
    }

    // Handle specific actions first
    if (action === 'check-mapping') {
      try {
        const accountId = await getHederaAccountId(walletAddress);
        const isMapped = await isWalletMapped(walletAddress);

        return NextResponse.json({
          success: true,
          isMapped,
          accountId,
          walletAddress,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error checking wallet mapping:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to check wallet mapping',
          },
          { status: 500 },
        );
      }
    }

    const tokenId = process.env.WEC_TOKEN_ID || mockEnergyToken.tokenId;

    // Try to get or create Hedera account ID for the wallet
    let hederaAccountId: string | null = null;
    try {
      hederaAccountId = await ensureHederaAccount(walletAddress);
    } catch (error) {
      console.warn(`Could not get Hedera account for ${walletAddress}:`, error);
    }

    // Force mock mode if we can't map to Hedera account or if explicitly enabled
    const useMockMode = MOCK_MODE || !hederaAccountId;

    if (useMockMode) {
      return NextResponse.json({
        success: true,
        mockMode: true,
        tokenId,
        walletAddress,
        userRole,
        balance: 0, // In mock mode without tracking, return 0
        canMint: userRole === 'prosumer',
        canBurn: userRole === 'prosumer',
        message:
          userRole === 'prosumer'
            ? 'Prosumer can mint and burn tokens (simulation mode)'
            : 'Viewer role - read-only access (simulation mode)',
        timestamp: new Date().toISOString(),
        note: 'This is a simulation. Real balance requires Hedera account mapping.',
      });
    }

    // Real implementation with proper Hedera account mapping
    const hederaService = getHederaTokenService();

    // Ensure we have a valid account ID before proceeding
    if (!hederaAccountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to map wallet address to Hedera account ID',
          walletAddress,
          message: 'Please try again or contact support if this issue persists',
        },
        { status: 400 },
      );
    }

    const accountId = hederaAccountId; // Now TypeScript knows it's not null

    try {
      const balance = await hederaService.getTokenBalance(accountId, tokenId);

      return NextResponse.json({
        success: true,
        mockMode: false,
        tokenId,
        walletAddress,
        accountId,
        userRole,
        balance: balance.balance,
        canMint: userRole === 'prosumer',
        canBurn: userRole === 'prosumer',
        explorerUrl: `https://hashscan.io/testnet/account/${accountId}`,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to get wallet information: ${error.message}`,
          walletAddress,
          accountId,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error in wallet-tokens GET endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
