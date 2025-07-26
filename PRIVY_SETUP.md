# Privy Wallet Integration Setup

This project now includes Privy wallet integration for connecting users to your EnergyFi dApp.

## Setup Instructions

### 1. Install Privy Package
```bash
npm install @privy-io/react-auth
```

### 2. Environment Variables
Create a `.env.local` file in your project root and add your Privy App ID:

```env
NEXT_PUBLIC_PRIVY_ID=your-privy-app-id-here
```

To get your Privy App ID:
1. Go to [Privy Console](https://console.privy.io/)
2. Create a new app or select an existing one
3. Copy the App ID from your dashboard

### 3. Features Included

#### Connect Wallet Button
- **Wallet Connection**: Users can connect existing wallets (MetaMask, WalletConnect, etc.)
- **Email Login**: Users can login with email OTP (creates embedded wallet automatically)
- **User Display**: Shows connected user info and logout option
- **Loading States**: Proper loading states while Privy initializes

#### Privy Configuration
- **Embedded Wallets**: Automatically creates wallets for users without one
- **Custom Theme**: Matches your EnergyFi green color scheme (#10b981)
- **Custom Headers**: "Connect to EnergyFi" and "Connect your wallet to start trading solar energy"

### 4. Usage

The connect wallet button is now integrated into your navigation bar. Users can:
- Click "CONNECT WALLET" to connect existing wallets
- Click "LOGIN WITH EMAIL" to login with email and get an embedded wallet
- See their connection status and logout when connected

### 5. Next Steps

After setup, you can:
- Add transaction functionality using `useSendTransaction` hook
- Implement energy trading features
- Add user profile management
- Integrate with Hedera network

## Files Created/Modified

- `components/privy-provider.tsx` - Privy provider wrapper
- `components/connect-wallet-button.tsx` - Connect wallet component
- `app/layout.tsx` - Updated to include Privy provider
- `app/page.tsx` - Updated navigation to use connect wallet button 