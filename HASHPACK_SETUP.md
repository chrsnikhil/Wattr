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

Replace `your_project_id_here` with your actual WalletConnect project ID.

## How it works

The HashPack integration uses HashConnect v3, which is a helper library around the Hedera WalletConnect standard. When you click "CONNECT HASHPACK":

1. The app opens a pairing modal with a QR code
2. You can scan the QR code with your HashPack mobile app
3. Or use the HashPack browser extension if available
4. Once paired, your real Hedera account ID will be displayed
5. You can then use this for token operations

## Current Status

- ✅ HashConnect v3 integration implemented with dynamic imports
- ✅ Proper event handling for pairing/disconnection
- ✅ SSR issues resolved with client-side only initialization
- ⚠️ Need to set up WalletConnect project ID
- ⚠️ Need to test with real HashPack wallet

## Testing Steps

1. **Get a WalletConnect Project ID:**
   - Go to https://cloud.walletconnect.com/
   - Create a new project
   - Copy the project ID

2. **Set up environment:**
   - Create `.env.local` file in project root
   - Add: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id`

3. **Install HashPack:**
   - Install HashPack mobile app on your phone
   - Or install HashPack browser extension

4. **Test the connection:**
   - Start your development server: `npm run dev`
   - Click "CONNECT HASHPACK" button
   - Scan the QR code with your HashPack app
   - Your real Hedera account ID should appear

## Troubleshooting

- If you see a mock account ID (0.0.1234567), it means the real connection failed
- Check the browser console for detailed logs
- Make sure you have the HashPack app installed
- Verify your WalletConnect project ID is correct
- Ensure you're using the correct network (testnet for development)

## Next Steps

Once the connection is working:
1. Test token operations with your real account
2. Switch to mainnet for production
3. Add proper error handling for failed connections
4. Implement transaction signing functionality 