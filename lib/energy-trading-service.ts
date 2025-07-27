import {
  Client,
  PrivateKey,
  AccountId,
  TransferTransaction,
  TokenAssociateTransaction,
  AccountBalanceQuery,
  TokenId,
  Hbar,
} from '@hashgraph/sdk';

// Types for energy trading
export interface EnergyListing {
  id: string;
  sellerId: string;
  sellerName?: string;
  energyAmount: number; // kWh
  pricePerKwh: number; // Price in HBAR or USD cents
  totalPrice: number;
  location?: string;
  energySource: 'solar' | 'wind' | 'hydro' | 'other';
  timestamp: string;
  isActive: boolean;
  expiresAt?: string;
}

export interface EnergyTrade {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  buyerName?: string;
  sellerName?: string;
  energyAmount: number;
  pricePerKwh: number;
  totalPrice: number;
  energySource: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timestamp: string;
  completedAt?: string;
  location?: string;
}

export interface UserProfile {
  accountId: string;
  name: string;
  location?: string;
  isProducer: boolean;
  isConsumer: boolean;
  totalEnergyProduced?: number;
  totalEnergyConsumed?: number;
  totalTradeVolume?: number;
  reputation?: number;
}

// Singleton instance of the shared WEC token
export const SHARED_WEC_TOKEN = {
  tokenId: process.env.WEC_TOKEN_ID || '0.0.PLACEHOLDER', // Will be set after token creation
  name: 'WattrEnergyCredit',
  symbol: 'WEC',
  decimals: 2,
  description: 'Decentralized energy credits for renewable energy trading',
} as const;

export class EnergyTradingService {
  private client: Client;
  private operatorPrivateKey: PrivateKey;
  private operatorAccountId: AccountId;

  // In-memory storage (in production, use database)
  private listings: Map<string, EnergyListing> = new Map();
  private trades: Map<string, EnergyTrade> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();

  constructor() {
    // Initialize Hedera client
    this.client = Client.forTestnet();

    const privateKeyString = process.env.HEDERA_PRIVATE_KEY;
    const accountIdString = process.env.HEDERA_ACCOUNT_ID;

    if (!privateKeyString || !accountIdString) {
      throw new Error('Hedera credentials required for energy trading');
    }

    this.operatorPrivateKey = PrivateKey.fromStringDer(privateKeyString);
    this.operatorAccountId = AccountId.fromString(accountIdString);
    this.client.setOperator(this.operatorAccountId, this.operatorPrivateKey);
  }

  /**
   * Create a new energy listing for sale
   */
  async createEnergyListing(
    sellerId: string,
    energyAmount: number,
    pricePerKwh: number,
    energySource: 'solar' | 'wind' | 'hydro' | 'other',
    location?: string,
    expiresInHours: number = 24,
  ): Promise<EnergyListing> {
    try {
      // Verify seller has enough energy tokens
      const sellerBalance = await this.getEnergyBalance(sellerId);

      if (sellerBalance < energyAmount) {
        throw new Error(
          `Insufficient energy balance. Available: ${sellerBalance} kWh, Required: ${energyAmount} kWh`,
        );
      }

      const listingId = `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(
        Date.now() + expiresInHours * 60 * 60 * 1000,
      ).toISOString();

      const listing: EnergyListing = {
        id: listingId,
        sellerId,
        sellerName: this.userProfiles.get(sellerId)?.name,
        energyAmount,
        pricePerKwh,
        totalPrice: energyAmount * pricePerKwh,
        location,
        energySource,
        timestamp: new Date().toISOString(),
        isActive: true,
        expiresAt,
      };

      this.listings.set(listingId, listing);

      console.log(
        `Created energy listing: ${energyAmount} kWh for ${pricePerKwh} per kWh`,
      );
      return listing;
    } catch (error) {
      console.error('Error creating energy listing:', error);
      throw new Error(
        `Failed to create listing: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Execute a P2P energy trade between buyer and seller
   */
  async executeEnergyTrade(
    listingId: string,
    buyerId: string,
    buyerPrivateKey?: string,
  ): Promise<EnergyTrade> {
    try {
      const listing = this.listings.get(listingId);
      if (!listing) {
        throw new Error('Energy listing not found');
      }

      if (!listing.isActive) {
        throw new Error('Energy listing is no longer active');
      }

      if (listing.sellerId === buyerId) {
        throw new Error('Cannot buy your own energy listing');
      }

      // Check if listing has expired
      if (listing.expiresAt && new Date(listing.expiresAt) < new Date()) {
        listing.isActive = false;
        throw new Error('Energy listing has expired');
      }

      // Verify buyer has sufficient balance (for payment - in real system)
      const buyerBalance = await this.getEnergyBalance(buyerId);
      console.log(`Buyer ${buyerId} current balance: ${buyerBalance} WEC`);

      // Create trade record
      const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const trade: EnergyTrade = {
        id: tradeId,
        listingId,
        buyerId,
        sellerId: listing.sellerId,
        buyerName: this.userProfiles.get(buyerId)?.name,
        sellerName: this.userProfiles.get(listing.sellerId)?.name,
        energyAmount: listing.energyAmount,
        pricePerKwh: listing.pricePerKwh,
        totalPrice: listing.totalPrice,
        energySource: listing.energySource,
        status: 'pending',
        timestamp: new Date().toISOString(),
        location: listing.location,
      };

      // Execute the token transfer on Hedera
      console.log(
        `Executing energy trade: ${listing.energyAmount} WEC from ${listing.sellerId} to ${buyerId}`,
      );

      const transferTransaction = new TransferTransaction()
        .addTokenTransfer(
          SHARED_WEC_TOKEN.tokenId,
          listing.sellerId,
          -listing.energyAmount * Math.pow(10, SHARED_WEC_TOKEN.decimals), // Negative for sender
        )
        .addTokenTransfer(
          SHARED_WEC_TOKEN.tokenId,
          buyerId,
          listing.energyAmount * Math.pow(10, SHARED_WEC_TOKEN.decimals), // Positive for receiver
        )
        .setTransactionMemo(
          `Energy trade: ${listing.energyAmount} kWh from ${listing.energySource} source`,
        )
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(this.client);

      // Sign with seller's key (in real system, would need multi-sig or escrow)
      const transferSigned = await transferTransaction.sign(
        this.operatorPrivateKey,
      );

      // If buyer provided private key, sign with that too
      if (buyerPrivateKey) {
        const buyerKey = PrivateKey.fromString(buyerPrivateKey);
        await transferSigned.sign(buyerKey);
      }

      const transferSubmit = await transferSigned.execute(this.client);
      const transferReceipt = await transferSubmit.getReceipt(this.client);

      if (transferReceipt.status.toString() === 'SUCCESS') {
        trade.transactionId = transferSubmit.transactionId.toString();
        trade.status = 'completed';
        trade.completedAt = new Date().toISOString();

        // Mark listing as inactive
        listing.isActive = false;

        // Update user trading volumes
        this.updateUserTradingStats(
          listing.sellerId,
          buyerId,
          listing.energyAmount,
          listing.totalPrice,
        );

        console.log(
          `Energy trade completed successfully! Transaction ID: ${trade.transactionId}`,
        );
      } else {
        trade.status = 'failed';
        throw new Error(
          `Transfer failed with status: ${transferReceipt.status}`,
        );
      }

      this.trades.set(tradeId, trade);
      return trade;
    } catch (error) {
      console.error('Error executing energy trade:', error);

      // Update trade status to failed if it exists
      const existingTrade = Array.from(this.trades.values()).find(
        t =>
          t.listingId === listingId &&
          t.buyerId === buyerId &&
          t.status === 'pending',
      );

      if (existingTrade) {
        existingTrade.status = 'failed';
      }

      throw new Error(
        `Failed to execute trade: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Associate WEC token with user account (required before trading)
   */
  async associateUserWithWEC(
    accountId: string,
    userPrivateKey: string,
  ): Promise<string> {
    try {
      console.log(`Associating WEC token with account ${accountId}`);

      const privateKey = PrivateKey.fromString(userPrivateKey);

      const associateTransaction = new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([SHARED_WEC_TOKEN.tokenId])
        .setMaxTransactionFee(new Hbar(5))
        .freezeWith(this.client);

      const associateSigned = await associateTransaction.sign(privateKey);
      const associateSubmit = await associateSigned.execute(this.client);
      const associateReceipt = await associateSubmit.getReceipt(this.client);

      const transactionId = associateSubmit.transactionId.toString();
      console.log(
        `Token association successful! Transaction ID: ${transactionId}`,
      );

      return transactionId;
    } catch (error) {
      console.error('Error associating token:', error);
      throw new Error(
        `Failed to associate token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get user's WEC token balance
   */
  async getEnergyBalance(accountId: string): Promise<number> {
    try {
      const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);
      const balance = await balanceQuery.execute(this.client);

      const tokenBalance =
        balance.tokens?.get(TokenId.fromString(SHARED_WEC_TOKEN.tokenId)) || 0;
      return Number(tokenBalance) / Math.pow(10, SHARED_WEC_TOKEN.decimals);
    } catch (error) {
      console.error('Error getting energy balance:', error);
      return 0;
    }
  }

  /**
   * Get all active energy listings
   */
  getActiveListings(): EnergyListing[] {
    const now = new Date();
    return Array.from(this.listings.values())
      .filter(listing => {
        if (!listing.isActive) return false;
        if (listing.expiresAt && new Date(listing.expiresAt) < now) {
          listing.isActive = false;
          return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  /**
   * Get user's trading history
   */
  getUserTrades(accountId: string): EnergyTrade[] {
    return Array.from(this.trades.values())
      .filter(
        trade => trade.buyerId === accountId || trade.sellerId === accountId,
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  /**
   * Get user's active listings
   */
  getUserListings(accountId: string): EnergyListing[] {
    return Array.from(this.listings.values())
      .filter(listing => listing.sellerId === accountId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  /**
   * Cancel an energy listing
   */
  cancelListing(listingId: string, sellerId: string): boolean {
    const listing = this.listings.get(listingId);
    if (listing && listing.sellerId === sellerId && listing.isActive) {
      listing.isActive = false;
      console.log(`Cancelled energy listing: ${listingId}`);
      return true;
    }
    return false;
  }

  /**
   * Register or update user profile
   */
  registerUser(profile: UserProfile): void {
    this.userProfiles.set(profile.accountId, profile);
    console.log(`Registered user: ${profile.name} (${profile.accountId})`);
  }

  /**
   * Get user profile
   */
  getUserProfile(accountId: string): UserProfile | undefined {
    return this.userProfiles.get(accountId);
  }

  /**
   * Update user trading statistics
   */
  private updateUserTradingStats(
    sellerId: string,
    buyerId: string,
    energyAmount: number,
    totalPrice: number,
  ): void {
    const seller = this.userProfiles.get(sellerId);
    const buyer = this.userProfiles.get(buyerId);

    if (seller) {
      seller.totalTradeVolume = (seller.totalTradeVolume || 0) + totalPrice;
      seller.totalEnergyProduced =
        (seller.totalEnergyProduced || 0) + energyAmount;
    }

    if (buyer) {
      buyer.totalTradeVolume = (buyer.totalTradeVolume || 0) + totalPrice;
      buyer.totalEnergyConsumed =
        (buyer.totalEnergyConsumed || 0) + energyAmount;
    }
  }

  /**
   * Get trading statistics
   */
  getTradingStats() {
    const totalTrades = this.trades.size;
    const completedTrades = Array.from(this.trades.values()).filter(
      t => t.status === 'completed',
    ).length;
    const totalVolume = Array.from(this.trades.values())
      .filter(t => t.status === 'completed')
      .reduce((sum, trade) => sum + trade.totalPrice, 0);
    const totalEnergyTraded = Array.from(this.trades.values())
      .filter(t => t.status === 'completed')
      .reduce((sum, trade) => sum + trade.energyAmount, 0);

    return {
      totalTrades,
      completedTrades,
      totalVolume,
      totalEnergyTraded,
      activeListings: this.getActiveListings().length,
      registeredUsers: this.userProfiles.size,
    };
  }
}

// Singleton instance
let tradingServiceInstance: EnergyTradingService | null = null;

export function getEnergyTradingService(): EnergyTradingService {
  if (!tradingServiceInstance) {
    tradingServiceInstance = new EnergyTradingService();
  }
  return tradingServiceInstance;
}
