import { NextRequest, NextResponse } from 'next/server';
import {
  getHederaTokenService,
  mockEnergyToken,
} from '@/lib/hedera-token-service';

// Environment check for mock mode
const MOCK_MODE =
  process.env.HEDERA_MOCK_MODE === 'true' ||
  !process.env.HEDERA_PRIVATE_KEY ||
  !process.env.HEDERA_ACCOUNT_ID;

export async function GET(request: NextRequest) {
  try {
    if (MOCK_MODE) {
      console.log('Running in mock mode - returning shared WEC token data');
      return NextResponse.json({
        success: true,
        mockMode: true,
        token: {
          ...mockEnergyToken,
          message: 'Shared WattrEnergyCredit token for all users',
          tokenId: process.env.WEC_TOKEN_ID || mockEnergyToken.tokenId,
        },
        message: 'Shared WEC token (Hedera not configured)',
        operatorAccountId: '0.0.12345',
        network: 'testnet',
        timestamp: new Date().toISOString(),
      });
    }

    // In production, return the shared WEC token information
    const hederaService = getHederaTokenService();

    return NextResponse.json({
      success: true,
      mockMode: false,
      token: {
        tokenId: process.env.WEC_TOKEN_ID || 'Not configured',
        name: 'WattrEnergyCredit',
        symbol: 'WEC',
        decimals: 2,
        description: 'Shared energy credit token for all Wattr users',
      },
      message: 'Shared WEC token - automated minting/burning via energy meters',
      operatorAccountId: process.env.HEDERA_ACCOUNT_ID,
      network: 'testnet',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in token GET endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get token information',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (MOCK_MODE) {
      console.log('Running in mock mode - simulating token operations');

      switch (action) {
        case 'create':
          return NextResponse.json({
            success: false,
            mockMode: true,
            error: 'Token creation disabled - using shared WEC token',
            message: 'All users share the same WattrEnergyCredit (WEC) token',
            sharedToken: {
              ...mockEnergyToken,
              tokenId: process.env.WEC_TOKEN_ID || mockEnergyToken.tokenId,
            },
            timestamp: new Date().toISOString(),
          });

        case 'mint':
          return NextResponse.json({
            success: false,
            mockMode: true,
            error: 'Manual minting disabled - tokens are minted automatically',
            message:
              'Tokens are minted automatically when renewable energy is produced',
            redirectTo: '/energy-metering',
            timestamp: new Date().toISOString(),
          });

        case 'burn':
          return NextResponse.json({
            success: false,
            mockMode: true,
            error: 'Manual burning disabled - tokens are burned automatically',
            message: 'Tokens are burned automatically when energy is consumed',
            redirectTo: '/energy-metering',
            timestamp: new Date().toISOString(),
          });

        case 'transfer':
          return NextResponse.json({
            success: false,
            mockMode: true,
            error: 'Manual transfers disabled - use P2P energy trading',
            message:
              'Use the energy trading marketplace for P2P energy transactions',
            redirectTo: '/energy-trading',
            timestamp: new Date().toISOString(),
          });

        case 'balance':
          return NextResponse.json({
            success: true,
            mockMode: true,
            balance: {
              accountId: params.accountId || '0.0.12345',
              tokenId: process.env.WEC_TOKEN_ID || mockEnergyToken.tokenId,
              balance: Math.random() * 1000, // Random balance for demo
            },
            timestamp: new Date().toISOString(),
          });

        case 'associate':
          return NextResponse.json({
            success: true,
            mockMode: true,
            action: 'associate',
            accountId: params.accountId || '0.0.12345',
            tokenId: process.env.WEC_TOKEN_ID || mockEnergyToken.tokenId,
            transactionId: 'mock-associate-' + Date.now(),
            message: 'Associated with shared WEC token',
            timestamp: new Date().toISOString(),
          });

        case 'burn':
          return NextResponse.json({
            success: false,
            mockMode: true,
            error: 'Manual burning disabled - tokens are burned automatically',
            message: 'Tokens are burned automatically when energy is consumed',
            redirectTo: '/energy-metering',
            timestamp: new Date().toISOString(),
          });

        default:
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid action specified',
              availableActions: ['balance', 'associate'],
              disabledActions: ['create', 'mint', 'transfer', 'burn'],
              message:
                'Limited operations available - use energy trading and metering services',
            },
            { status: 400 },
          );
      }
    }

    // Real Hedera implementation
    const hederaService = getHederaTokenService();

    switch (action) {
      case 'create':
        return NextResponse.json(
          {
            success: false,
            error: 'Token creation disabled - using shared WEC token',
            message: 'All users share the same WattrEnergyCredit (WEC) token',
            sharedTokenId: process.env.WEC_TOKEN_ID,
          },
          { status: 403 },
        );

      case 'mint':
        return NextResponse.json(
          {
            success: false,
            error: 'Manual minting disabled - tokens are minted automatically',
            message:
              'Tokens are minted automatically when renewable energy is produced',
            redirectTo: '/api/energy-metering',
          },
          { status: 403 },
        );

      case 'burn':
        return NextResponse.json(
          {
            success: false,
            error: 'Manual burning disabled - tokens are burned automatically',
            message: 'Tokens are burned automatically when energy is consumed',
            redirectTo: '/api/energy-metering',
          },
          { status: 403 },
        );

      case 'transfer':
        return NextResponse.json(
          {
            success: false,
            error: 'Manual transfers disabled - use P2P energy trading',
            message:
              'Use the energy trading marketplace for P2P energy transactions',
            redirectTo: '/api/energy-trading',
          },
          { status: 403 },
        );

      case 'associate':
        const associateTxId = await hederaService.associateToken(
          params.accountId,
          process.env.WEC_TOKEN_ID!, // Use shared WEC token
          params.privateKey, // Optional - will use operator key if not provided
        );

        return NextResponse.json({
          success: true,
          mockMode: false,
          action: 'associate',
          accountId: params.accountId,
          tokenId: process.env.WEC_TOKEN_ID,
          transactionId: associateTxId,
          message: 'Associated with shared WEC token',
          explorerUrl: `https://hashscan.io/testnet/transaction/${associateTxId}`,
          timestamp: new Date().toISOString(),
        });

      case 'balance':
        const balance = await hederaService.getTokenBalance(
          params.accountId,
          process.env.WEC_TOKEN_ID!, // Use shared WEC token
        );

        return NextResponse.json({
          success: true,
          mockMode: false,
          balance: {
            ...balance,
            tokenId: process.env.WEC_TOKEN_ID,
          },
          explorerUrl: `https://hashscan.io/testnet/account/${params.accountId}`,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action specified',
            availableActions: ['balance', 'associate'],
            disabledActions: ['create', 'mint', 'transfer', 'burn'],
            message:
              'Limited operations available - use energy trading and metering services',
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Error in token POST endpoint:', error);
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
