import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import PrivyProviderWrapper from '@/components/privy-provider';
import ErrorBoundary from '@/components/error-boundary';

export const metadata: Metadata = {
  title: 'Wattr',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ErrorBoundary>
          <PrivyProviderWrapper>{children}</PrivyProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
