import { getRedisClient } from './redis-client';

// Types for energy trading
export interface EnergyListing {
  id: string;
  sellerId: string;
  sellerName: string;
  energyAmount: number;
  pricePerKwh: number;
  totalPrice: number;
  location: string;
  energySource: 'solar' | 'wind' | 'hydro' | 'geothermal' | 'other';
  timestamp: string;
  isActive: boolean;
  expiresAt: string;
}

export interface EnergyTrade {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  energyAmount: number;
  pricePerKwh: number;
  totalPrice: number;
  energySource: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  completedAt?: string;
  location: string;
}

export interface TradingStats {
  totalTrades: number;
  completedTrades: number;
  totalVolume: number;
  totalEnergyTraded: number;
  activeListings: number;
  registeredUsers: number;
}

export interface UserProfile {
  accountId: string;
  name: string;
  location: string;
  isProducer: boolean;
  isConsumer: boolean;
  totalEnergyProduced: number;
  totalEnergyConsumed: number;
  totalTradeVolume: number;
  reputation: number;
}

// Redis keys
const LISTING_PREFIX = 'energy_listing:';
const TRADE_PREFIX = 'energy_trade:';
const USER_PREFIX = 'user_profile:';
const ACTIVE_LISTINGS_SET = 'active_listings';
const ALL_TRADES_SET = 'all_trades';
const USER_LISTINGS_PREFIX = 'user_listings:';
const USER_TRADES_PREFIX = 'user_trades:';
const STATS_KEY = 'trading_stats';

/**
 * Redis-based Energy Trading Service
 */
export class RedisEnergyTradingService {
  private redis = getRedisClient();

  /**
   * Create a new energy listing
   */
  async createEnergyListing(
    sellerId: string,
    energyAmount: number,
    pricePerKwh: number,
    energySource: EnergyListing['energySource'],
    location: string,
    expiresInHours: number = 24,
  ): Promise<EnergyListing> {
    const listingId = `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

    const listing: EnergyListing = {
      id: listingId,
      sellerId,
      sellerName: `Seller ${sellerId.slice(-6)}`, // Placeholder, could be enhanced
      energyAmount,
      pricePerKwh,
      totalPrice: energyAmount * pricePerKwh,
      location,
      energySource,
      timestamp: now.toISOString(),
      isActive: true,
      expiresAt: expiresAt.toISOString(),
    };

    // Save listing
    await this.redis.set(
      `${LISTING_PREFIX}${listingId}`,
      JSON.stringify(listing),
    );

    // Add to active listings
    await this.redis.sadd(ACTIVE_LISTINGS_SET, listingId);

    // Add to user's listings
    await this.redis.sadd(`${USER_LISTINGS_PREFIX}${sellerId}`, listingId);

    return listing;
  }

  /**
   * Get all active energy listings
   */
  async getActiveListings(): Promise<EnergyListing[]> {
    try {
      const listingIds = await this.redis.smembers(ACTIVE_LISTINGS_SET);
      const listings: EnergyListing[] = [];

      for (const listingId of listingIds) {
        const listingData = await this.redis.get(
          `${LISTING_PREFIX}${listingId}`,
        );
        if (listingData) {
          const listing: EnergyListing = JSON.parse(listingData);

          // Check if listing is still active and not expired
          const now = new Date();
          const expiresAt = new Date(listing.expiresAt);

          if (listing.isActive && expiresAt > now) {
            listings.push(listing);
          } else {
            // Remove expired or inactive listings
            await this.removeListingFromActive(listingId);
          }
        }
      }

      // Sort by timestamp (newest first)
      return listings.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    } catch (error) {
      console.error('Error getting active listings:', error);
      return [];
    }
  }

  /**
   * Get listings for a specific user
   */
  async getUserListings(accountId: string): Promise<EnergyListing[]> {
    try {
      const listingIds = await this.redis.smembers(
        `${USER_LISTINGS_PREFIX}${accountId}`,
      );
      const listings: EnergyListing[] = [];

      for (const listingId of listingIds) {
        const listingData = await this.redis.get(
          `${LISTING_PREFIX}${listingId}`,
        );
        if (listingData) {
          listings.push(JSON.parse(listingData));
        }
      }

      return listings.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    } catch (error) {
      console.error('Error getting user listings:', error);
      return [];
    }
  }

  /**
   * Execute an energy trade
   */
  async executeEnergyTrade(
    listingId: string,
    buyerId: string,
    buyerPrivateKey: string,
  ): Promise<EnergyTrade> {
    // Get listing
    const listingData = await this.redis.get(`${LISTING_PREFIX}${listingId}`);
    if (!listingData) {
      throw new Error('Listing not found');
    }

    const listing: EnergyListing = JSON.parse(listingData);

    if (!listing.isActive) {
      throw new Error('Listing is no longer active');
    }

    // Create trade
    const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const trade: EnergyTrade = {
      id: tradeId,
      listingId,
      buyerId,
      sellerId: listing.sellerId,
      buyerName: `Buyer ${buyerId.slice(-6)}`,
      sellerName: listing.sellerName,
      energyAmount: listing.energyAmount,
      pricePerKwh: listing.pricePerKwh,
      totalPrice: listing.totalPrice,
      energySource: listing.energySource,
      transactionId: `mock_tx_${Date.now()}`, // This would be real Hedera transaction ID
      status: 'completed',
      timestamp: now.toISOString(),
      completedAt: now.toISOString(),
      location: listing.location,
    };

    // Save trade
    await this.redis.set(`${TRADE_PREFIX}${tradeId}`, JSON.stringify(trade));

    // Add to all trades
    await this.redis.sadd(ALL_TRADES_SET, tradeId);

    // Add to buyer's trades
    await this.redis.sadd(`${USER_TRADES_PREFIX}${buyerId}`, tradeId);

    // Add to seller's trades
    await this.redis.sadd(`${USER_TRADES_PREFIX}${listing.sellerId}`, tradeId);

    // Mark listing as inactive
    listing.isActive = false;
    await this.redis.set(
      `${LISTING_PREFIX}${listingId}`,
      JSON.stringify(listing),
    );
    await this.removeListingFromActive(listingId);

    return trade;
  }

  /**
   * Get trades for a specific user
   */
  async getUserTrades(accountId: string): Promise<EnergyTrade[]> {
    try {
      const tradeIds = await this.redis.smembers(
        `${USER_TRADES_PREFIX}${accountId}`,
      );
      const trades: EnergyTrade[] = [];

      for (const tradeId of tradeIds) {
        const tradeData = await this.redis.get(`${TRADE_PREFIX}${tradeId}`);
        if (tradeData) {
          trades.push(JSON.parse(tradeData));
        }
      }

      return trades.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    } catch (error) {
      console.error('Error getting user trades:', error);
      return [];
    }
  }

  /**
   * Cancel a listing
   */
  async cancelListing(listingId: string, sellerId: string): Promise<boolean> {
    try {
      const listingData = await this.redis.get(`${LISTING_PREFIX}${listingId}`);
      if (!listingData) {
        return false;
      }

      const listing: EnergyListing = JSON.parse(listingData);

      if (listing.sellerId !== sellerId) {
        throw new Error('Unauthorized to cancel this listing');
      }

      // Mark as inactive
      listing.isActive = false;
      await this.redis.set(
        `${LISTING_PREFIX}${listingId}`,
        JSON.stringify(listing),
      );
      await this.removeListingFromActive(listingId);

      return true;
    } catch (error) {
      console.error('Error canceling listing:', error);
      return false;
    }
  }

  /**
   * Register a user
   */
  async registerUser(profile: UserProfile): Promise<void> {
    await this.redis.set(
      `${USER_PREFIX}${profile.accountId}`,
      JSON.stringify(profile),
    );
  }

  /**
   * Get user profile
   */
  async getUserProfile(accountId: string): Promise<UserProfile | null> {
    try {
      const profileData = await this.redis.get(`${USER_PREFIX}${accountId}`);
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Get trading statistics
   */
  async getTradingStats(): Promise<TradingStats> {
    try {
      // This could be cached and updated periodically for better performance
      const allTradesCount = await this.redis.scard(ALL_TRADES_SET);
      const activeListingsCount = await this.redis.scard(ACTIVE_LISTINGS_SET);

      // Get all users count (this could be optimized with a separate counter)
      const userKeys = await this.redis.keys(`${USER_PREFIX}*`);
      const registeredUsers = userKeys.length;

      // For completed trades and volume, we'd need to iterate through trades
      // For this implementation, we'll use simplified calculations
      const stats: TradingStats = {
        totalTrades: allTradesCount,
        completedTrades: allTradesCount, // Assuming all are completed for now
        totalVolume: allTradesCount * 100, // Simplified calculation
        totalEnergyTraded: allTradesCount * 50, // Simplified calculation
        activeListings: activeListingsCount,
        registeredUsers,
      };

      return stats;
    } catch (error) {
      console.error('Error getting trading stats:', error);
      return {
        totalTrades: 0,
        completedTrades: 0,
        totalVolume: 0,
        totalEnergyTraded: 0,
        activeListings: 0,
        registeredUsers: 0,
      };
    }
  }

  /**
   * Helper: Remove listing from active set
   */
  private async removeListingFromActive(listingId: string): Promise<void> {
    await this.redis.srem(ACTIVE_LISTINGS_SET, listingId);
  }

  /**
   * Clean up expired listings (can be run periodically)
   */
  async cleanupExpiredListings(): Promise<number> {
    try {
      const activeListingIds = await this.redis.smembers(ACTIVE_LISTINGS_SET);
      const now = new Date();
      let cleanedCount = 0;

      for (const listingId of activeListingIds) {
        const listingData = await this.redis.get(
          `${LISTING_PREFIX}${listingId}`,
        );
        if (listingData) {
          const listing: EnergyListing = JSON.parse(listingData);
          const expiresAt = new Date(listing.expiresAt);

          if (expiresAt <= now) {
            listing.isActive = false;
            await this.redis.set(
              `${LISTING_PREFIX}${listingId}`,
              JSON.stringify(listing),
            );
            await this.removeListingFromActive(listingId);
            cleanedCount++;
          }
        }
      }

      console.log(`Cleaned up ${cleanedCount} expired listings`);
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired listings:', error);
      return 0;
    }
  }
}

// Singleton instance
let tradingService: RedisEnergyTradingService | null = null;

/**
 * Get singleton instance of Redis Energy Trading Service
 */
export function getRedisEnergyTradingService(): RedisEnergyTradingService {
  if (!tradingService) {
    tradingService = new RedisEnergyTradingService();
  }
  return tradingService;
}
