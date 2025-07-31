# HashPack Integration Setup

## Getting a WalletConnect Project ID

To use HashPack with your application, you need a WalletConnect project ID:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy your project ID

## Environment Setup

Create a `.env.local` file in your project root and add:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## How it works

The HashPack integration uses HashConnect v3, which is a helper library around the Hedera WalletConnect standard. When you click "CONNECT HASHPACK":

1. The app opens a pairing modal
2. You can scan a QR code or use the HashPack extension
3. Once paired, your Hedera account ID will be displayed
4. You can then use this for token operations

## Current Status

- ✅ HashConnect v3 integration implemented
- ✅ Proper event handling for pairing/disconnection
- ✅ Fallback to mock connection for development
- ⚠️ Need to set up WalletConnect project ID
- ⚠️ Need to test with real HashPack wallet

## Testing

1. Install HashPack browser extension
2. Set up your WalletConnect project ID
3. Click "CONNECT HASHPACK" button
4. Follow the pairing process
5. Your real Hedera account ID should appear

## Troubleshooting

- If you see a mock account ID (0.0.1234567), it means the real connection failed
- Check the browser console for detailed logs
- Make sure you have the HashPack extension installed
- Verify your WalletConnect project ID is correct 