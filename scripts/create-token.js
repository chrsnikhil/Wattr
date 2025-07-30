#!/usr/bin/env node

/**
 * Token Creation Script for Wattr Energy Credits (WEC)
 *
 * This script creates the WEC token on Hedera testnet and updates your .env.local file
 */

const { getHederaTokenService } = require('./lib/hedera-token-service');
const fs = require('fs');
const path = require('path');

async function createEnergyToken() {
  try {
    console.log(
      '🚀 Creating Wattr Energy Credit (WEC) token on Hedera testnet...\n',
    );

    // Check if environment variables are set
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
      console.error(
        '❌ Error: Please set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY in your .env.local file',
      );
      console.log('   Get your credentials from: https://portal.hedera.com/');
      process.exit(1);
    }

    // Initialize Hedera service
    const hederaService = getHederaTokenService();

    // Create the token
    const token = await hederaService.createEnergyToken(
      'WattrEnergyCredit', // Token name
      'WEC', // Token symbol
      2, // Decimals (1 WEC = 1 kWh, 0.01 WEC = 10 Wh)
      1000000, // Initial supply (1 million tokens)
    );

    console.log('✅ Token created successfully!');
    console.log('📋 Token Details:');
    console.log(`   Token ID: ${token.tokenId}`);
    console.log(`   Name: ${token.name}`);
    console.log(`   Symbol: ${token.symbol}`);
    console.log(`   Decimals: ${token.decimals}`);
    console.log(`   Total Supply: ${token.totalSupply.toLocaleString()} WEC`);
    console.log(`   Treasury Account: ${token.treasuryAccountId}`);

    // Update .env.local with the token ID
    const envPath = path.join(__dirname, '.env.local');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');

      // Update existing WEC_TOKEN_ID or add it
      if (envContent.includes('WEC_TOKEN_ID=')) {
        envContent = envContent.replace(
          /WEC_TOKEN_ID=.*/,
          `WEC_TOKEN_ID=${token.tokenId}`,
        );
      } else {
        envContent += `\nWEC_TOKEN_ID=${token.tokenId}`;
      }
    } else {
      envContent = `WEC_TOKEN_ID=${token.tokenId}\n`;
    }

    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Updated .env.local with token ID');
    console.log('🔗 View your token on HashScan:');
    console.log(`   https://hashscan.io/testnet/token/${token.tokenId}`);

    console.log('\n🎉 Setup complete! You can now use real Hedera operations.');
    console.log('   Restart your development server to use the new token.');
  } catch (error) {
    console.error('❌ Error creating token:', error.message);

    if (error.message.includes('INVALID_ACCOUNT_ID')) {
      console.log(
        '\n💡 Tip: Check your HEDERA_ACCOUNT_ID format (should be like 0.0.12345)',
      );
    }

    if (error.message.includes('INVALID_PRIVATE_KEY')) {
      console.log(
        '\n💡 Tip: Check your HEDERA_PRIVATE_KEY format (DER encoded hex string)',
      );
    }

    if (error.message.includes('INSUFFICIENT_PAYER_BALANCE')) {
      console.log(
        '\n💡 Tip: Your account needs testnet HBAR. Get some from the faucet:',
      );
      console.log('   https://portal.hedera.com/ → Testnet → Faucet');
    }

    process.exit(1);
  }
}

// Run the script
createEnergyToken();
