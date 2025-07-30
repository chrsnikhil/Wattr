import fs from 'fs';
import path from 'path';
import { getHederaTokenService } from './hedera-token-service';

// Interface for wallet mapping data
interface WalletMapping {
  accountId: string;
  privateKey: string;
  publicKey: string;
  walletAddress: string;
  createdAt: string;
}

interface WalletMappingsData {
  walletMappings: Record<string, WalletMapping>;
  lastUpdated: string | null;
}

// Path to the mappings file
const MAPPINGS_FILE = path.join(process.cwd(), 'data', 'wallet-mappings.json');

/**
 * Load wallet mappings from file
 */
function loadWalletMappings(): WalletMappingsData {
  try {
    if (!fs.existsSync(MAPPINGS_FILE)) {
      // Create default structure if file doesn't exist
      const defaultData: WalletMappingsData = {
        walletMappings: {},
        lastUpdated: null,
      };
      fs.mkdirSync(path.dirname(MAPPINGS_FILE), { recursive: true });
      fs.writeFileSync(MAPPINGS_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }

    const fileContent = fs.readFileSync(MAPPINGS_FILE, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error loading wallet mappings:', error);
    return {
      walletMappings: {},
      lastUpdated: null,
    };
  }
}

/**
 * Save wallet mappings to file
 */
function saveWalletMappings(data: WalletMappingsData): void {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(MAPPINGS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving wallet mappings:', error);
    throw new Error('Failed to save wallet mappings');
  }
}

/**
 * Get Hedera account ID for a wallet address
 */
export function getHederaAccountId(walletAddress: string): string | null {
  const data = loadWalletMappings();
  const mapping = data.walletMappings[walletAddress.toLowerCase()];
  return mapping ? mapping.accountId : null;
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
    const existingAccountId = getHederaAccountId(walletAddress);
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

    // Save the mapping
    const data = loadWalletMappings();
    data.walletMappings[walletAddress.toLowerCase()] = {
      accountId: accountData.accountId,
      privateKey: accountData.privateKey,
      publicKey: accountData.publicKey,
      walletAddress: walletAddress,
      createdAt: new Date().toISOString(),
    };
    saveWalletMappings(data);

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
export function getWalletPrivateKey(walletAddress: string): string | null {
  const data = loadWalletMappings();
  const mapping = data.walletMappings[walletAddress.toLowerCase()];
  return mapping ? mapping.privateKey : null;
}

/**
 * Get all wallet mappings (for admin/debugging)
 */
export function getAllWalletMappings(): Record<string, WalletMapping> {
  const data = loadWalletMappings();
  return data.walletMappings;
}

/**
 * Associate the WEC token with a wallet's Hedera account
 */
export async function associateTokenWithWallet(
  walletAddress: string,
  tokenId: string,
): Promise<string> {
  try {
    const accountId = getHederaAccountId(walletAddress);
    if (!accountId) {
      throw new Error('No Hedera account found for wallet');
    }

    const accountPrivateKey = getWalletPrivateKey(walletAddress);
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
