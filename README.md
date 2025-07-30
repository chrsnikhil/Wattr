# Energy Tokenization Platform

A Next.js application for tokenizing renewable energy production using Hedera Hashgraph and Hedera Guardian for data verification.

## Features

- **Wallet Integration**: Connect wallets using Privy
- **Real Energy Data**: Fetch actual energy production data from NREL (National Renewable Energy Laboratory)
- **Guardian Ready**: Data structure prepared for Hedera Guardian validation
- **Token System**: Ready for Hedera token minting based on verified energy data
- **Modern UI**: Built with shadcn/ui and Tailwind CSS

## Prerequisites

Before you begin, make sure you have set up your Privy app and obtained your app ID from the Privy Dashboard.

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Privy Wallet Integration
NEXT_PUBLIC_PRIVY_ID=your-privy-app-id

# NREL Energy Data API (Optional - uses demo key if not provided)
NREL_API_KEY=your-nrel-api-key

# Hedera Blockchain Configuration (Required for real operations)
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=your-der-encoded-private-key
WEC_TOKEN_ID=0.0.YOUR_TOKEN_ID

# Redis Cloud Database (Required for production)
REDIS_URL=rediss://username:password@your-redis-cloud-instance.com:port

# Optional: Enable mock mode (defaults to true if Hedera credentials missing)
HEDERA_MOCK_MODE=false
```

### Getting API Keys

#### Privy App ID

1. Go to [Privy Dashboard](https://console.privy.io/)
2. Create a new app or select an existing one
3. Copy your App ID
4. Add it to `NEXT_PUBLIC_PRIVY_ID` in your `.env.local`

#### Redis Cloud Database

1. Go to [Redis Cloud](https://cloud.redis.io/)
2. Create a free account and database
3. Copy the Redis URL (starts with `rediss://`)
4. Add it to `REDIS_URL` in your `.env.local`

#### Hedera Testnet Setup

1. Create an account on [Hedera Portal](https://portal.hedera.com/)
2. Generate testnet credentials
3. Create a token for energy credits
4. Add credentials to your `.env.local`

#### NREL API Key (Optional)

1. Visit [NREL Developer Network](https://developer.nrel.gov/)
2. Sign up for a free account
3. Request an API key
4. Add it to `NREL_API_KEY` in your `.env.local`

**Note**: The app works with the demo key, but you'll have limited API requests. For production use, get your own API key.

## Database Architecture

### Redis Cloud Integration

The platform uses Redis Cloud for:

- **Wallet Mappings**: Ethereum wallet ↔ Hedera account associations
- **Energy Listings**: Real-time energy trading marketplace data
- **User Profiles**: Trader information and reputation
- **Trading History**: Complete transaction records
- **Performance**: Fast lookups and real-time updates

### Fallback Modes

- **Redis Available**: Full database functionality with persistence
- **No Redis**: In-memory storage (development only)
- **Mock Mode**: Simulated operations for testing

## First-Time User Setup

### Automated Onboarding Process

New users go through a guided setup:

1. **Wallet Connection**: Connect existing wallet or create embedded wallet
2. **Hedera Account Creation**: Automatic blockchain account with 10 HBAR balance
3. **Token Association**: Associate with WEC (Wattr Energy Credits) tokens
4. **Profile Setup**: Complete trader profile (producer/consumer)

### Setup Flow

- Accessible at `/setup` route
- Automatically redirected if wallet not mapped
- Progress tracking with visual indicators
- Error handling and retry mechanisms

## Privy Wallet Integration Setup

### Features

- **Embedded Wallets**: Automatically creates wallets for users without existing ones
- **External Wallet Support**: Connect MetaMask and other external wallets
- **Email Authentication**: Login with email OTP
- **Multi-chain Support**: Ethereum and other EVM chains
- **Hedera Integration**: Individual blockchain accounts for each wallet

### Usage

The wallet connection is integrated into the main navigation. Users can:

1. Click "CONNECT WALLET" to start authentication
2. Choose between email login or external wallet connection
3. Complete first-time setup if new user
4. Access dashboard with real blockchain operations
5. View their connected wallet address and balance
6. Logout when needed

## NREL Energy Data Integration

### Real Energy Data Sources

The platform fetches actual energy production data from:

- **NREL Solar Radiation Research Laboratory** (Golden, CO)
- **Boulder Atmospheric Observatory** (Boulder, CO)
- **San Diego Solar Station** (San Diego, CA)
- **Austin Energy Solar Farm** (Austin, TX)
- **Phoenix Solar Research Center** (Phoenix, AZ)

### Data Types

- **Solar Energy**: Real-time solar irradiance and calculated energy production
- **Wind Energy**: Wind speed data and calculated wind turbine output
- **Weather Data**: Temperature, humidity, and atmospheric conditions

### Guardian Validation Ready

All energy data includes:

- GPS coordinates for geographic verification
- Timestamp data for temporal validation
- Source attribution for data provenance
- Weather parameters for cross-validation

## Hedera Guardian Integration

### Data Structure

The energy data is structured for Guardian validation:

```typescript
{
  userId: string,
  energyAmount: number,
  source: 'solar' | 'wind',
  timestamp: string,
  verified: boolean,
  nrelData: {
    solarIrradiance?: number,
    windSpeed?: number,
    latitude: number,
    longitude: number,
    elevation: number,
    timezone: string
  },
  dataSource: string,
  guardianValidation: 'pending' | 'verified' | 'failed'
}
```

### Validation Process

1. **Data Collection**: Real energy data from NREL APIs
2. **Guardian Submission**: Send data to Hedera Guardian for verification
3. **Cross-validation**: Guardian validates against:
   - Historical weather data
   - Geographic consistency
   - Temporal accuracy
   - Source reliability
4. **Token Minting**: Mint energy tokens for verified data

### Next Steps for Guardian Integration

- [ ] Set up Hedera Guardian instance
- [ ] Configure Guardian policies for energy data validation
- [ ] Implement Guardian API integration
- [ ] Add token minting based on verified data
- [ ] Create Guardian dashboard for validation status

## Development

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### API Endpoints

#### Smart Meter API (`/api/smart-meter`)

- **GET**: Fetch real energy data from NREL
- **POST**: Submit energy data for Guardian validation

#### Query Parameters

- `userId`: Filter by specific user/location
- `source`: Filter by energy source (solar, wind)

### Data Refresh

- Real NREL data refreshes every 30 seconds
- Weather data is fetched in real-time
- Energy calculations are performed locally

## Token System Design

### Energy Token Structure

```typescript
{
  tokenId: string,
  energyAmount: number,
  source: 'solar' | 'wind',
  location: string,
  timestamp: string,
  guardianVerified: boolean,
  tokenMetadata: {
    carbonOffset: number,
    renewableCredits: number,
    geographicRegion: string
  }
}
```

### Token Economics

- **1 kWh Solar** = **1 Solar Energy Token**
- **1 kWh Wind** = **1 Wind Energy Token**
- **Carbon Credits**: Calculated based on energy source and location
- **Geographic Premium**: Tokens from high-solar/wind regions may have higher value

### Minting Process

1. User connects wallet
2. Energy data is validated by Guardian
3. Tokens are minted on Hedera network
4. User receives tokens in their wallet
5. Transaction is recorded on Hedera

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions about:

- **Privy Integration**: Check [Privy Documentation](https://docs.privy.io/)
- **NREL API**: Visit [NREL Developer Network](https://developer.nrel.gov/)
- **Hedera Guardian**: Refer to [Guardian Documentation](https://docs.hedera.com/guardian/)
- **Hedera Network**: See [Hedera Documentation](https://docs.hedera.com/)
