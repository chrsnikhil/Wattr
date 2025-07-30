import { getRedisClient } from './redis-client';
import { getHederaTokenService } from './hedera-token-service';

// Interface for wallet mapping data
export interface WalletMapping {
  accountId: string;
  privateKey: string;
  publicKey: string;
  walletAddress: string;
  createdAt: string;
}

// Redis keys
const WALLET_MAPPING_PREFIX = 'wallet_mapping:';
const WALLET_LIST_KEY = 'wallet_addresses';

/**
 * Get Hedera account ID for a wallet address
 */
export async function getHederaAccountId(
  walletAddress: string,
): Promise<string | null> {
  try {
    const redis = getRedisClient();
    const key = `${WALLET_MAPPING_PREFIX}${walletAddress.toLowerCase()}`;
    const mappingData = await redis.get(key);

    if (!mappingData) {
      return null;
    }

    const mapping: WalletMapping = JSON.parse(mappingData);
    return mapping.accountId;
  } catch (error) {
    console.error('Error getting Hedera account ID from Redis:', error);
    return null;
  }
}

/**
 * Check if a wallet address is already mapped to a Hedera account
 */
export async function isWalletMapped(walletAddress: string): Promise<boolean> {
  try {
    const accountId = await getHederaAccountId(walletAddress);
    return accountId !== null;
  } catch (error) {
    console.error('Error checking wallet mapping:', error);
    return false;
  }
}

/**
 * Create a new Hedera account for a wallet and save the mapping
 */
export async function createHederaAccountForWallet(
  walletAddress: string,
): Promise<string> {
  try {
    console.log(`Creating new Hedera account for wallet: ${walletAddress}`);

    // Check if mapping already exists
    const existingAccountId = await getHederaAccountId(walletAddress);
    if (existingAccountId) {
      console.log(
        `Account already exists for wallet ${walletAddress}: ${existingAccountId}`,
      );
      return existingAccountId;
    }

    // Create new Hedera account
    const hederaService = getHederaTokenService();
    const accountData = await hederaService.createAccount(
      10, // 10 HBAR initial balance
      `Wattr account for ${walletAddress.slice(0, 10)}...`,
    );

    // Save the mapping to Redis
    const mapping: WalletMapping = {
      accountId: accountData.accountId,
      privateKey: accountData.privateKey,
      publicKey: accountData.publicKey,
      walletAddress: walletAddress,
      createdAt: new Date().toISOString(),
    };

    const redis = getRedisClient();
    const key = `${WALLET_MAPPING_PREFIX}${walletAddress.toLowerCase()}`;

    // Save mapping data
    await redis.set(key, JSON.stringify(mapping));

    // Add to wallet addresses list
    await redis.sadd(WALLET_LIST_KEY, walletAddress.toLowerCase());

    console.log(
      `✅ Created Hedera account ${accountData.accountId} for wallet ${walletAddress}`,
    );
    return accountData.accountId;
  } catch (error) {
    console.error(
      `Error creating Hedera account for wallet ${walletAddress}:`,
      error,
    );
    throw new Error(
      `Failed to create Hedera account: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get private key for a wallet's Hedera account
 */
export async function getWalletPrivateKey(
  walletAddress: string,
): Promise<string | null> {
  try {
    const redis = getRedisClient();
    const key = `${WALLET_MAPPING_PREFIX}${walletAddress.toLowerCase()}`;
    const mappingData = await redis.get(key);

    if (!mappingData) {
      return null;
    }

    const mapping: WalletMapping = JSON.parse(mappingData);
    return mapping.privateKey;
  } catch (error) {
    console.error('Error getting wallet private key from Redis:', error);
    return null;
  }
}

/**
 * Get complete wallet mapping for a wallet address
 */
export async function getWalletMapping(
  walletAddress: string,
): Promise<WalletMapping | null> {
  try {
    const redis = getRedisClient();
    const key = `${WALLET_MAPPING_PREFIX}${walletAddress.toLowerCase()}`;
    const mappingData = await redis.get(key);

    if (!mappingData) {
      return null;
    }

    return JSON.parse(mappingData);
  } catch (error) {
    console.error('Error getting wallet mapping from Redis:', error);
    return null;
  }
}

/**
 * Get all wallet mappings (for admin/debugging)
 */
export async function getAllWalletMappings(): Promise<
  Record<string, WalletMapping>
> {
  try {
    const redis = getRedisClient();
    const walletAddresses = await redis.smembers(WALLET_LIST_KEY);

    const mappings: Record<string, WalletMapping> = {};

    for (const address of walletAddresses) {
      const key = `${WALLET_MAPPING_PREFIX}${address}`;
      const mappingData = await redis.get(key);

      if (mappingData) {
        mappings[address] = JSON.parse(mappingData);
      }
    }

    return mappings;
  } catch (error) {
    console.error('Error getting all wallet mappings from Redis:', error);
    return {};
  }
}

/**
 * Associate the WEC token with a wallet's Hedera account
 */
export async function associateTokenWithWallet(
  walletAddress: string,
  tokenId: string,
): Promise<string> {
  try {
    const accountId = await getHederaAccountId(walletAddress);
    if (!accountId) {
      throw new Error('No Hedera account found for wallet');
    }

    const accountPrivateKey = await getWalletPrivateKey(walletAddress);
    if (!accountPrivateKey) {
      throw new Error('No private key found for wallet account');
    }

    const hederaService = getHederaTokenService();
    const transactionId = await hederaService.associateToken(
      accountId,
      tokenId,
      accountPrivateKey,
    );

    console.log(
      `✅ Associated token ${tokenId} with account ${accountId} for wallet ${walletAddress}`,
    );
    return transactionId;
  } catch (error) {
    console.error(
      `Error associating token with wallet ${walletAddress}:`,
      error,
    );
    throw error;
  }
}

/**
 * Delete a wallet mapping (for testing/cleanup)
 */
export async function deleteWalletMapping(
  walletAddress: string,
): Promise<void> {
  try {
    const redis = getRedisClient();
    const key = `${WALLET_MAPPING_PREFIX}${walletAddress.toLowerCase()}`;

    await redis.del(key);
    await redis.srem(WALLET_LIST_KEY, walletAddress.toLowerCase());

    console.log(`Deleted wallet mapping for ${walletAddress}`);
  } catch (error) {
    console.error('Error deleting wallet mapping:', error);
    throw error;
  }
}

/**
 * Get total number of mapped wallets
 */
export async function getMappedWalletsCount(): Promise<number> {
  try {
    const redis = getRedisClient();
    return await redis.scard(WALLET_LIST_KEY);
  } catch (error) {
    console.error('Error getting mapped wallets count:', error);
    return 0;
  }
}
