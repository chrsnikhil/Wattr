import { NextRequest, NextResponse } from 'next/server';
import { getEnergyTradingService } from '@/lib/energy-trading-service';

// Mock mode check
const MOCK_MODE =
  process.env.HEDERA_MOCK_MODE === 'true' ||
  !process.env.HEDERA_PRIVATE_KEY ||
  !process.env.HEDERA_ACCOUNT_ID;

// Mock data for development
const mockListings = [
  {
    id: 'mock_listing_1',
    sellerId: '0.0.12345',
    sellerName: 'Solar Farm Alpha',
    energyAmount: 50,
    pricePerKwh: 0.12,
    totalPrice: 6.0,
    location: 'Austin, TX',
    energySource: 'solar' as const,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock_listing_2',
    sellerId: '0.0.67890',
    sellerName: 'Wind Power Collective',
    energyAmount: 100,
    pricePerKwh: 0.1,
    totalPrice: 10.0,
    location: 'Portland, OR',
    energySource: 'wind' as const,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock_listing_3',
    sellerId: '0.0.54321',
    sellerName: 'Rooftop Solar Network',
    energyAmount: 25,
    pricePerKwh: 0.15,
    totalPrice: 3.75,
    location: 'San Diego, CA',
    energySource: 'solar' as const,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isActive: true,
    expiresAt: new Date(Date.now() + 23.5 * 60 * 60 * 1000).toISOString(),
  },
];

const mockTrades = [
  {
    id: 'mock_trade_1',
    listingId: 'mock_listing_old_1',
    buyerId: '0.0.11111',
    sellerId: '0.0.22222',
    buyerName: 'Green Home',
    sellerName: 'Solar Panel Co',
    energyAmount: 75,
    pricePerKwh: 0.11,
    totalPrice: 8.25,
    energySource: 'solar',
    transactionId: '0.0.12345@1753600000.123456789',
    status: 'completed' as const,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 4.8 * 60 * 60 * 1000).toISOString(),
    location: 'Denver, CO',
  },
  {
    id: 'mock_trade_2',
    listingId: 'mock_listing_old_2',
    buyerId: '0.0.33333',
    sellerId: '0.0.44444',
    buyerName: 'Eco Business',
    sellerName: 'Wind Farm Beta',
    energyAmount: 150,
    pricePerKwh: 0.09,
    totalPrice: 13.5,
    energySource: 'wind',
    transactionId: '0.0.12345@1753590000.987654321',
    status: 'completed' as const,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 7.5 * 60 * 60 * 1000).toISOString(),
    location: 'Kansas City, MO',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const accountId = searchParams.get('accountId');

    if (MOCK_MODE) {
      console.log('Running in mock mode - returning mock trading data');

      switch (action) {
        case 'listings':
          return NextResponse.json({
            success: true,
            mockMode: true,
            listings: mockListings,
            timestamp: new Date().toISOString(),
          });

        case 'user-trades':
          if (!accountId) {
            return NextResponse.json(
              { success: false, error: 'Account ID required for user trades' },
              { status: 400 },
            );
          }
          return NextResponse.json({
            success: true,
            mockMode: true,
            trades: mockTrades.filter(
              t => t.buyerId === accountId || t.sellerId === accountId,
            ),
            timestamp: new Date().toISOString(),
          });

        case 'user-listings':
          if (!accountId) {
            return NextResponse.json(
              {
                success: false,
                error: 'Account ID required for user listings',
              },
              { status: 400 },
            );
          }
          return NextResponse.json({
            success: true,
            mockMode: true,
            listings: mockListings.filter(l => l.sellerId === accountId),
            timestamp: new Date().toISOString(),
          });

        case 'stats':
          return NextResponse.json({
            success: true,
            mockMode: true,
            stats: {
              totalTrades: 15,
              completedTrades: 12,
              totalVolume: 156.75,
              totalEnergyTraded: 1250,
              activeListings: 3,
              registeredUsers: 8,
            },
            timestamp: new Date().toISOString(),
          });

        default:
          return NextResponse.json({
            success: true,
            mockMode: true,
            message: 'Energy trading service available (mock mode)',
            availableActions: [
              'listings',
              'user-trades',
              'user-listings',
              'stats',
            ],
            timestamp: new Date().toISOString(),
          });
      }
    }

    // Real implementation
    const tradingService = getEnergyTradingService();

    switch (action) {
      case 'listings':
        const listings = tradingService.getActiveListings();
        return NextResponse.json({
          success: true,
          mockMode: false,
          listings,
          timestamp: new Date().toISOString(),
        });

      case 'user-trades':
        if (!accountId) {
          return NextResponse.json(
            { success: false, error: 'Account ID required for user trades' },
            { status: 400 },
          );
        }
        const userTrades = tradingService.getUserTrades(accountId);
        return NextResponse.json({
          success: true,
          mockMode: false,
          trades: userTrades,
          timestamp: new Date().toISOString(),
        });

      case 'user-listings':
        if (!accountId) {
          return NextResponse.json(
            { success: false, error: 'Account ID required for user listings' },
            { status: 400 },
          );
        }
        const userListings = tradingService.getUserListings(accountId);
        return NextResponse.json({
          success: true,
          mockMode: false,
          listings: userListings,
          timestamp: new Date().toISOString(),
        });

      case 'stats':
        const stats = tradingService.getTradingStats();
        return NextResponse.json({
          success: true,
          mockMode: false,
          stats,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          success: true,
          mockMode: false,
          message: 'Energy trading service available',
          availableActions: [
            'listings',
            'user-trades',
            'user-listings',
            'stats',
          ],
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('Error in trading GET endpoint:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (MOCK_MODE) {
      console.log('Running in mock mode - simulating trading operations');

      switch (action) {
        case 'create-listing':
          const mockListing = {
            id: `mock_listing_${Date.now()}`,
            sellerId: params.sellerId || '0.0.12345',
            sellerName: params.sellerName || 'Mock Seller',
            energyAmount: params.energyAmount || 50,
            pricePerKwh: params.pricePerKwh || 0.12,
            totalPrice:
              (params.energyAmount || 50) * (params.pricePerKwh || 0.12),
            location: params.location || 'Mock City',
            energySource: params.energySource || 'solar',
            timestamp: new Date().toISOString(),
            isActive: true,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          };

          return NextResponse.json({
            success: true,
            mockMode: true,
            action: 'create-listing',
            listing: mockListing,
            timestamp: new Date().toISOString(),
          });

        case 'execute-trade':
          const mockTrade = {
            id: `mock_trade_${Date.now()}`,
            listingId: params.listingId || 'mock_listing_1',
            buyerId: params.buyerId || '0.0.67890',
            sellerId: params.sellerId || '0.0.12345',
            buyerName: params.buyerName || 'Mock Buyer',
            sellerName: params.sellerName || 'Mock Seller',
            energyAmount: params.energyAmount || 50,
            pricePerKwh: params.pricePerKwh || 0.12,
            totalPrice:
              (params.energyAmount || 50) * (params.pricePerKwh || 0.12),
            energySource: params.energySource || 'solar',
            transactionId: `mock-trade-${Date.now()}`,
            status: 'completed',
            timestamp: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            location: params.location || 'Mock City',
          };

          return NextResponse.json({
            success: true,
            mockMode: true,
            action: 'execute-trade',
            trade: mockTrade,
            explorerUrl: `https://hashscan.io/testnet/transaction/${mockTrade.transactionId}`,
            timestamp: new Date().toISOString(),
          });

        case 'associate-token':
          return NextResponse.json({
            success: true,
            mockMode: true,
            action: 'associate-token',
            accountId: params.accountId || '0.0.12345',
            transactionId: `mock-associate-${Date.now()}`,
            timestamp: new Date().toISOString(),
          });

        case 'cancel-listing':
          return NextResponse.json({
            success: true,
            mockMode: true,
            action: 'cancel-listing',
            listingId: params.listingId,
            cancelled: true,
            timestamp: new Date().toISOString(),
          });

        case 'register-user':
          return NextResponse.json({
            success: true,
            mockMode: true,
            action: 'register-user',
            user: {
              accountId: params.accountId || '0.0.12345',
              name: params.name || 'Mock User',
              location: params.location || 'Mock City',
              isProducer: params.isProducer || false,
              isConsumer: params.isConsumer || true,
            },
            timestamp: new Date().toISOString(),
          });

        default:
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid action specified',
              availableActions: [
                'create-listing',
                'execute-trade',
                'associate-token',
                'cancel-listing',
                'register-user',
              ],
            },
            { status: 400 },
          );
      }
    }

    // Real implementation
    const tradingService = getEnergyTradingService();

    switch (action) {
      case 'create-listing':
        const listing = await tradingService.createEnergyListing(
          params.sellerId,
          params.energyAmount,
          params.pricePerKwh,
          params.energySource,
          params.location,
          params.expiresInHours,
        );

        return NextResponse.json({
          success: true,
          mockMode: false,
          action: 'create-listing',
          listing,
          timestamp: new Date().toISOString(),
        });

      case 'execute-trade':
        const trade = await tradingService.executeEnergyTrade(
          params.listingId,
          params.buyerId,
          params.buyerPrivateKey,
        );

        return NextResponse.json({
          success: true,
          mockMode: false,
          action: 'execute-trade',
          trade,
          explorerUrl: trade.transactionId
            ? `https://hashscan.io/testnet/transaction/${trade.transactionId}`
            : undefined,
          timestamp: new Date().toISOString(),
        });

      case 'associate-token':
        const associateTxId = await tradingService.associateUserWithWEC(
          params.accountId,
          params.userPrivateKey,
        );

        return NextResponse.json({
          success: true,
          mockMode: false,
          action: 'associate-token',
          accountId: params.accountId,
          transactionId: associateTxId,
          explorerUrl: `https://hashscan.io/testnet/transaction/${associateTxId}`,
          timestamp: new Date().toISOString(),
        });

      case 'cancel-listing':
        const cancelled = tradingService.cancelListing(
          params.listingId,
          params.sellerId,
        );

        return NextResponse.json({
          success: true,
          mockMode: false,
          action: 'cancel-listing',
          listingId: params.listingId,
          cancelled,
          timestamp: new Date().toISOString(),
        });

      case 'register-user':
        tradingService.registerUser({
          accountId: params.accountId,
          name: params.name,
          location: params.location,
          isProducer: params.isProducer || false,
          isConsumer: params.isConsumer || true,
          totalEnergyProduced: 0,
          totalEnergyConsumed: 0,
          totalTradeVolume: 0,
          reputation: 5.0,
        });

        return NextResponse.json({
          success: true,
          mockMode: false,
          action: 'register-user',
          user: tradingService.getUserProfile(params.accountId),
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action specified',
            availableActions: [
              'create-listing',
              'execute-trade',
              'associate-token',
              'cancel-listing',
              'register-user',
            ],
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Error in trading POST endpoint:', error);
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
