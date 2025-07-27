import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenBurnTransaction,
  TransferTransaction,
  AccountBalanceQuery,
  TokenAssociateTransaction,
  TokenDissociateTransaction,
  Hbar,
  TokenId,
  PublicKey,
} from '@hashgraph/sdk';

// Types for our energy credit system
export interface EnergyToken {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  treasuryAccountId: string;
}

export interface TokenTransfer {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  tokenId: string;
  transactionId?: string;
  timestamp?: string;
}

export interface TokenBalance {
  accountId: string;
  tokenId: string;
  balance: number;
}

// Hedera client configuration
export class HederaTokenService {
  private client: Client;
  private operatorPrivateKey: PrivateKey;
  private operatorAccountId: AccountId;

  constructor() {
    // Initialize Hedera client for testnet
    this.client = Client.forTestnet();

    // Get credentials from environment variables
    const privateKeyString = process.env.HEDERA_PRIVATE_KEY;
    const accountIdString = process.env.HEDERA_ACCOUNT_ID;

    if (!privateKeyString || !accountIdString) {
      throw new Error('Hedera credentials not found in environment variables');
    }

    this.operatorPrivateKey = PrivateKey.fromString(privateKeyString);
    this.operatorAccountId = AccountId.fromString(accountIdString);

    // Set operator for the client
    this.client.setOperator(this.operatorAccountId, this.operatorPrivateKey);
  }

  /**
   * Create a new Energy Credit Token
   * 1 token = 1 kWh of renewable energy
   */
  async createEnergyToken(
    tokenName: string = 'WattrEnergyCredit',
    tokenSymbol: string = 'WEC',
    decimals: number = 2,
    initialSupply: number = 1000000, // 1 million tokens initially
  ): Promise<EnergyToken> {
    try {
      console.log('Creating Energy Credit Token...');

      // Create the token creation transaction
      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setDecimals(decimals)
        .setInitialSupply(initialSupply * Math.pow(10, decimals)) // Adjust for decimals
        .setTokenType(TokenType.FungibleCommon)
        .setSupplyType(TokenSupplyType.Infinite) // Allow minting more tokens as needed
        .setTreasuryAccountId(this.operatorAccountId)
        .setAdminKey(this.operatorPrivateKey.publicKey)
        .setSupplyKey(this.operatorPrivateKey.publicKey)
        .setFreezeKey(this.operatorPrivateKey.publicKey)
        .setWipeKey(this.operatorPrivateKey.publicKey)
        .setMaxTransactionFee(new Hbar(30))
        .freezeWith(this.client);

      // Sign and execute the transaction
      const tokenCreateTxSigned = await tokenCreateTx.sign(
        this.operatorPrivateKey,
      );
      const tokenCreateSubmit = await tokenCreateTxSigned.execute(this.client);
      const tokenCreateRx = await tokenCreateSubmit.getReceipt(this.client);

      const tokenId = tokenCreateRx.tokenId?.toString();
      if (!tokenId) {
        throw new Error('Token creation failed - no token ID returned');
      }

      console.log(
        `Energy Credit Token created successfully! Token ID: ${tokenId}`,
      );

      return {
        tokenId,
        name: tokenName,
        symbol: tokenSymbol,
        decimals,
        totalSupply: initialSupply,
        treasuryAccountId: this.operatorAccountId.toString(),
      };
    } catch (error) {
      console.error('Error creating energy token:', error);
      throw new Error(
        `Failed to create energy token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Mint new energy tokens (when new renewable energy is produced)
   */
  async mintEnergyTokens(
    tokenId: string,
    amount: number,
    memo: string = 'Renewable energy production',
  ): Promise<string> {
    try {
      console.log(`Minting ${amount} energy tokens...`);

      const tokenMintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(amount * 100) // Adjust for 2 decimal places
        .setTransactionMemo(memo)
        .setMaxTransactionFee(new Hbar(20))
        .freezeWith(this.client);

      const tokenMintTxSigned = await tokenMintTx.sign(this.operatorPrivateKey);
      const tokenMintSubmit = await tokenMintTxSigned.execute(this.client);
      const tokenMintRx = await tokenMintSubmit.getReceipt(this.client);

      const transactionId = tokenMintSubmit.transactionId.toString();
      console.log(
        `Successfully minted ${amount} tokens. Transaction ID: ${transactionId}`,
      );

      return transactionId;
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw new Error(
        `Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Transfer energy tokens between accounts (energy trading)
   */
  async transferEnergyTokens(
    tokenId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    memo: string = 'Energy credit transfer',
  ): Promise<TokenTransfer> {
    try {
      console.log(
        `Transferring ${amount} energy tokens from ${fromAccountId} to ${toAccountId}`,
      );

      const transferTx = new TransferTransaction()
        .addTokenTransfer(tokenId, fromAccountId, -amount * 100) // Negative for sender
        .addTokenTransfer(tokenId, toAccountId, amount * 100) // Positive for receiver
        .setTransactionMemo(memo)
        .setMaxTransactionFee(new Hbar(10))
        .freezeWith(this.client);

      const transferTxSigned = await transferTx.sign(this.operatorPrivateKey);
      const transferSubmit = await transferTxSigned.execute(this.client);
      const transferRx = await transferSubmit.getReceipt(this.client);

      const transactionId = transferSubmit.transactionId.toString();
      const timestamp = new Date().toISOString();

      console.log(`Transfer successful! Transaction ID: ${transactionId}`);

      return {
        fromAccountId,
        toAccountId,
        amount,
        tokenId,
        transactionId,
        timestamp,
      };
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw new Error(
        `Failed to transfer tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Associate a token with an account (required before receiving tokens)
   */
  async associateToken(
    accountId: string,
    tokenId: string,
    accountPrivateKey?: string,
  ): Promise<string> {
    try {
      console.log(`Associating token ${tokenId} with account ${accountId}`);

      // Use provided private key or operator key
      const privateKey = accountPrivateKey
        ? PrivateKey.fromString(accountPrivateKey)
        : this.operatorPrivateKey;

      const associateTx = new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .setMaxTransactionFee(new Hbar(5))
        .freezeWith(this.client);

      const associateTxSigned = await associateTx.sign(privateKey);
      const associateSubmit = await associateTxSigned.execute(this.client);
      const associateRx = await associateSubmit.getReceipt(this.client);

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
   * Get token balance for an account
   */
  async getTokenBalance(
    accountId: string,
    tokenId: string,
  ): Promise<TokenBalance> {
    try {
      const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);

      const balance = await balanceQuery.execute(this.client);
      const tokenBalance =
        balance.tokens?.get(TokenId.fromString(tokenId)) || 0;

      return {
        accountId,
        tokenId,
        balance: Number(tokenBalance) / 100, // Adjust for 2 decimal places
      };
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error(
        `Failed to get token balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get account balance (HBAR)
   */
  async getAccountBalance(accountId: string): Promise<number> {
    try {
      const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);

      const balance = await balanceQuery.execute(this.client);
      return balance.hbars.toTinybars().toNumber() / 100_000_000; // Convert to HBAR
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw new Error(
        `Failed to get account balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Burn energy tokens (when energy is consumed)
   */
  async burnEnergyTokens(
    tokenId: string,
    amount: number,
    memo: string = 'Energy consumption',
  ): Promise<string> {
    try {
      console.log(`Burning ${amount} energy tokens...`);

      const tokenBurnTx = new TokenBurnTransaction()
        .setTokenId(tokenId)
        .setAmount(amount * 100) // Adjust for 2 decimal places
        .setTransactionMemo(memo)
        .setMaxTransactionFee(new Hbar(20))
        .freezeWith(this.client);

      const tokenBurnTxSigned = await tokenBurnTx.sign(this.operatorPrivateKey);
      const tokenBurnSubmit = await tokenBurnTxSigned.execute(this.client);
      const tokenBurnRx = await tokenBurnSubmit.getReceipt(this.client);

      const transactionId = tokenBurnSubmit.transactionId.toString();
      console.log(
        `Successfully burned ${amount} tokens. Transaction ID: ${transactionId}`,
      );

      return transactionId;
    } catch (error) {
      console.error('Error burning tokens:', error);
      throw new Error(
        `Failed to burn tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get transaction details from Hedera
   */
  async getTransactionDetails(transactionId: string): Promise<any> {
    try {
      // Note: This would typically use Hedera Mirror Node API
      // For now, we'll return basic info
      return {
        transactionId,
        status: 'SUCCESS',
        explorerUrl: `https://hashscan.io/testnet/transaction/${transactionId}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      throw new Error(
        `Failed to get transaction details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Close the client connection
   */
  close(): void {
    this.client.close();
  }
}

// Singleton instance for the application
let hederaTokenService: HederaTokenService | null = null;

export function getHederaTokenService(): HederaTokenService {
  if (!hederaTokenService) {
    hederaTokenService = new HederaTokenService();
  }
  return hederaTokenService;
}

// Mock data for testing when Hedera is not available
export const mockEnergyToken: EnergyToken = {
  tokenId: '0.0.123456',
  name: 'WattrEnergyCredit',
  symbol: 'WEC',
  decimals: 2,
  totalSupply: 1000000,
  treasuryAccountId: '0.0.12345',
};

export const mockTokenTransfers: TokenTransfer[] = [
  {
    fromAccountId: '0.0.12345',
    toAccountId: '0.0.54321',
    amount: 25.5,
    tokenId: '0.0.123456',
    transactionId: '0.0.12345@1690123456.123456789',
    timestamp: '2025-07-27T10:30:00.000Z',
  },
  {
    fromAccountId: '0.0.54321',
    toAccountId: '0.0.98765',
    amount: 12.0,
    tokenId: '0.0.123456',
    transactionId: '0.0.54321@1690123500.123456789',
    timestamp: '2025-07-27T10:35:00.000Z',
  },
];
