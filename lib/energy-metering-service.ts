import { getHederaTokenService } from './hedera-token-service';
import {
  getEnergyTradingService,
  SHARED_WEC_TOKEN,
} from './energy-trading-service';

// Types for energy metering
export interface EnergyMeterReading {
  meterId: string;
  accountId: string;
  meterType: 'production' | 'consumption';
  energyAmount: number; // kWh
  energySource?: 'solar' | 'wind' | 'hydro' | 'grid' | 'other';
  timestamp: string;
  verified: boolean;
  verificationSource: 'guardian' | 'smart_meter' | 'manual';
  location?: string;
  meterSerialNumber?: string;
}

export interface TokenMintRecord {
  id: string;
  accountId: string;
  energyAmount: number;
  tokenAmount: number;
  meterId: string;
  transactionId?: string;
  timestamp: string;
  verified: boolean;
  energySource: string;
}

export interface TokenBurnRecord {
  id: string;
  accountId: string;
  energyAmount: number;
  tokenAmount: number;
  meterId: string;
  transactionId?: string;
  timestamp: string;
  consumptionType: 'residential' | 'commercial' | 'industrial';
}

// Mock energy readings for demonstration
const mockEnergyReadings: EnergyMeterReading[] = [
  {
    meterId: 'SOLAR_001',
    accountId: '0.0.12345',
    meterType: 'production',
    energyAmount: 45.7,
    energySource: 'solar',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    verified: true,
    verificationSource: 'smart_meter',
    location: 'Austin, TX',
    meterSerialNumber: 'SM-2024-001',
  },
  {
    meterId: 'WIND_002',
    accountId: '0.0.67890',
    meterType: 'production',
    energyAmount: 123.4,
    energySource: 'wind',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    verified: true,
    verificationSource: 'guardian',
    location: 'Kansas, OK',
    meterSerialNumber: 'WM-2024-002',
  },
  {
    meterId: 'HOME_001',
    accountId: '0.0.54321',
    meterType: 'consumption',
    energyAmount: 28.9,
    energySource: 'grid',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    verified: true,
    verificationSource: 'smart_meter',
    location: 'Portland, OR',
    meterSerialNumber: 'HM-2024-001',
  },
];

export class EnergyMeteringService {
  private tokenService: any;
  private tradingService: any;

  // In-memory storage (in production, use database)
  private meterReadings: Map<string, EnergyMeterReading[]> = new Map();
  private mintRecords: Map<string, TokenMintRecord> = new Map();
  private burnRecords: Map<string, TokenBurnRecord> = new Map();
  private lastProcessedReadings: Map<string, string> = new Map(); // meterId -> last timestamp

  constructor() {
    // Initialize services
    try {
      this.tokenService = getHederaTokenService();
      this.tradingService = getEnergyTradingService();
    } catch (error) {
      console.log('Services not available, using mock mode');
      this.tokenService = null;
      this.tradingService = null;
    }

    // Load mock data
    this.loadMockData();
  }

  /**
   * Process new energy meter reading and automatically mint/burn tokens
   */
  async processEnergyReading(reading: EnergyMeterReading): Promise<{
    processed: boolean;
    action: 'mint' | 'burn' | 'none';
    tokenAmount?: number;
    transactionId?: string;
    record?: TokenMintRecord | TokenBurnRecord;
  }> {
    try {
      console.log(
        `Processing energy reading: ${reading.energyAmount} kWh from ${reading.meterId}`,
      );

      // Validate reading
      if (!reading.verified) {
        throw new Error('Energy reading not verified - cannot process tokens');
      }

      if (reading.energyAmount <= 0) {
        throw new Error('Invalid energy amount');
      }

      // Check if this reading was already processed
      const lastProcessed = this.lastProcessedReadings.get(reading.meterId);
      if (
        lastProcessed &&
        new Date(lastProcessed) >= new Date(reading.timestamp)
      ) {
        console.log(`Reading already processed or too old: ${reading.meterId}`);
        return { processed: false, action: 'none' };
      }

      // Store the reading
      if (!this.meterReadings.has(reading.meterId)) {
        this.meterReadings.set(reading.meterId, []);
      }
      this.meterReadings.get(reading.meterId)!.push(reading);

      // Determine action based on meter type
      if (reading.meterType === 'production') {
        return await this.handleEnergyProduction(reading);
      } else if (reading.meterType === 'consumption') {
        return await this.handleEnergyConsumption(reading);
      } else {
        throw new Error(`Unknown meter type: ${reading.meterType}`);
      }
    } catch (error) {
      console.error('Error processing energy reading:', error);
      throw new Error(
        `Failed to process reading: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Handle energy production by minting tokens
   */
  private async handleEnergyProduction(reading: EnergyMeterReading): Promise<{
    processed: boolean;
    action: 'mint';
    tokenAmount: number;
    transactionId?: string;
    record: TokenMintRecord;
  }> {
    const tokenAmount = reading.energyAmount; // 1:1 ratio (1 kWh = 1 WEC)

    const recordId = `mint_${reading.meterId}_${Date.now()}`;

    // Create mint record
    const mintRecord: TokenMintRecord = {
      id: recordId,
      accountId: reading.accountId,
      energyAmount: reading.energyAmount,
      tokenAmount,
      meterId: reading.meterId,
      timestamp: new Date().toISOString(),
      verified: reading.verified,
      energySource: reading.energySource || 'other',
    };

    try {
      // Mock mode or real Hedera integration
      if (!this.tokenService || process.env.HEDERA_MOCK_MODE === 'true') {
        console.log(
          `MOCK: Minting ${tokenAmount} WEC tokens for ${reading.accountId}`,
        );
        mintRecord.transactionId = `mock-mint-${Date.now()}`;
      } else {
        // Real token minting
        const transactionId = await this.tokenService.mintEnergyTokens(
          SHARED_WEC_TOKEN.tokenId,
          tokenAmount,
          `Renewable energy production: ${reading.energyAmount} kWh from ${reading.energySource} (${reading.meterId})`,
        );
        mintRecord.transactionId = transactionId;
        console.log(
          `Minted ${tokenAmount} WEC tokens for energy production. TX: ${transactionId}`,
        );
      }

      // Store record and update last processed
      this.mintRecords.set(recordId, mintRecord);
      this.lastProcessedReadings.set(reading.meterId, reading.timestamp);

      return {
        processed: true,
        action: 'mint',
        tokenAmount,
        transactionId: mintRecord.transactionId,
        record: mintRecord,
      };
    } catch (error) {
      console.error('Error minting tokens for energy production:', error);
      throw new Error(
        `Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Handle energy consumption by burning tokens
   */
  private async handleEnergyConsumption(reading: EnergyMeterReading): Promise<{
    processed: boolean;
    action: 'burn';
    tokenAmount: number;
    transactionId?: string;
    record: TokenBurnRecord;
  }> {
    const tokenAmount = reading.energyAmount; // 1:1 ratio (1 kWh = 1 WEC)

    const recordId = `burn_${reading.meterId}_${Date.now()}`;

    // Create burn record
    const burnRecord: TokenBurnRecord = {
      id: recordId,
      accountId: reading.accountId,
      energyAmount: reading.energyAmount,
      tokenAmount,
      meterId: reading.meterId,
      timestamp: new Date().toISOString(),
      consumptionType: 'residential', // Could be determined from meter data
    };

    try {
      // Check if user has enough tokens to burn
      if (this.tradingService) {
        const balance = await this.tradingService.getEnergyBalance(
          reading.accountId,
        );
        if (balance < tokenAmount) {
          console.log(
            `Insufficient tokens for consumption: ${balance} < ${tokenAmount}. Allowing for demo.`,
          );
          // In production, you might want to handle this differently
          // For now, we'll continue with the burn for demo purposes
        }
      }

      // Mock mode or real Hedera integration
      if (!this.tokenService || process.env.HEDERA_MOCK_MODE === 'true') {
        console.log(
          `MOCK: Burning ${tokenAmount} WEC tokens for ${reading.accountId}`,
        );
        burnRecord.transactionId = `mock-burn-${Date.now()}`;
      } else {
        // Real token burning
        const transactionId = await this.tokenService.burnEnergyTokens(
          SHARED_WEC_TOKEN.tokenId,
          tokenAmount,
          `Energy consumption: ${reading.energyAmount} kWh (${reading.meterId})`,
        );
        burnRecord.transactionId = transactionId;
        console.log(
          `Burned ${tokenAmount} WEC tokens for energy consumption. TX: ${transactionId}`,
        );
      }

      // Store record and update last processed
      this.burnRecords.set(recordId, burnRecord);
      this.lastProcessedReadings.set(reading.meterId, reading.timestamp);

      return {
        processed: true,
        action: 'burn',
        tokenAmount,
        transactionId: burnRecord.transactionId,
        record: burnRecord,
      };
    } catch (error) {
      console.error('Error burning tokens for energy consumption:', error);
      throw new Error(
        `Failed to burn tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get energy readings for a specific meter
   */
  getMeterReadings(meterId: string): EnergyMeterReading[] {
    return this.meterReadings.get(meterId) || [];
  }

  /**
   * Get all energy readings for an account
   */
  getAccountReadings(accountId: string): EnergyMeterReading[] {
    const allReadings: EnergyMeterReading[] = [];

    this.meterReadings.forEach(readings => {
      readings.forEach(reading => {
        if (reading.accountId === accountId) {
          allReadings.push(reading);
        }
      });
    });

    return allReadings.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Get mint records for an account
   */
  getAccountMintRecords(accountId: string): TokenMintRecord[] {
    return Array.from(this.mintRecords.values())
      .filter(record => record.accountId === accountId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  /**
   * Get burn records for an account
   */
  getAccountBurnRecords(accountId: string): TokenBurnRecord[] {
    return Array.from(this.burnRecords.values())
      .filter(record => record.accountId === accountId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  /**
   * Get energy production/consumption statistics
   */
  getEnergyStats() {
    const totalProduction = Array.from(this.mintRecords.values()).reduce(
      (sum, record) => sum + record.energyAmount,
      0,
    );

    const totalConsumption = Array.from(this.burnRecords.values()).reduce(
      (sum, record) => sum + record.energyAmount,
      0,
    );

    const totalTokensMinted = Array.from(this.mintRecords.values()).reduce(
      (sum, record) => sum + record.tokenAmount,
      0,
    );

    const totalTokensBurned = Array.from(this.burnRecords.values()).reduce(
      (sum, record) => sum + record.tokenAmount,
      0,
    );

    const netTokens = totalTokensMinted - totalTokensBurned;

    return {
      totalProduction,
      totalConsumption,
      totalTokensMinted,
      totalTokensBurned,
      netTokens,
      totalMeters: this.meterReadings.size,
      totalReadings: Array.from(this.meterReadings.values()).reduce(
        (sum, readings) => sum + readings.length,
        0,
      ),
    };
  }

  /**
   * Simulate real-time energy meter readings (for demo)
   */
  simulateEnergyReadings(): EnergyMeterReading[] {
    const now = new Date();
    const readings: EnergyMeterReading[] = [
      {
        meterId: 'SOLAR_SIM_001',
        accountId: '0.0.12345',
        meterType: 'production',
        energyAmount: Math.random() * 30 + 10, // 10-40 kWh
        energySource: 'solar',
        timestamp: now.toISOString(),
        verified: true,
        verificationSource: 'smart_meter',
        location: 'Simulated Location',
        meterSerialNumber: 'SIM-001',
      },
      {
        meterId: 'HOME_SIM_001',
        accountId: '0.0.67890',
        meterType: 'consumption',
        energyAmount: Math.random() * 20 + 5, // 5-25 kWh
        energySource: 'grid',
        timestamp: now.toISOString(),
        verified: true,
        verificationSource: 'smart_meter',
        location: 'Simulated Home',
        meterSerialNumber: 'SIM-002',
      },
    ];

    return readings;
  }

  /**
   * Load mock data for demonstration
   */
  private loadMockData(): void {
    mockEnergyReadings.forEach(reading => {
      if (!this.meterReadings.has(reading.meterId)) {
        this.meterReadings.set(reading.meterId, []);
      }
      this.meterReadings.get(reading.meterId)!.push(reading);
    });

    console.log(`Loaded ${mockEnergyReadings.length} mock energy readings`);
  }
}

// Singleton instance
let meteringServiceInstance: EnergyMeteringService | null = null;

export function getEnergyMeteringService(): EnergyMeteringService {
  if (!meteringServiceInstance) {
    meteringServiceInstance = new EnergyMeteringService();
  }
  return meteringServiceInstance;
}
