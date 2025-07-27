'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

interface PrivyProviderWrapperProps {
  children: ReactNode;
}

export default function PrivyProviderWrapper({
  children,
}: PrivyProviderWrapperProps) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_ID;

  if (!privyAppId) {
    console.warn(
      'Privy App ID not found. Wallet functionality will be disabled.',
    );
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#10b981',
          showWalletLoginFirst: true,
          landingHeader: 'Connect to EnergyFi',
          loginMessage: 'Connect your wallet to start trading solar energy',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
