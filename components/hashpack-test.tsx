'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useHashPack } from './hashpack-provider';

export default function HashPackTest() {
  const { isConnected, accountId, connect, disconnect, isLoading, error } =
    useHashPack();

  return (
    <div className="p-4 border-2 border-black bg-white shadow-[4px_4px_0px_0px_#4a5568]">
      <h3 className="text-lg font-bold mb-4">HashPack Connection Test</h3>
      <div className="space-y-2 text-sm">
        <div>isConnected: {isConnected ? 'true' : 'false'}</div>
        <div>accountId: {accountId || 'null'}</div>
        <div>isLoading: {isLoading ? 'true' : 'false'}</div>
        <div className={`${error ? 'text-red-600' : 'text-gray-600'}`}>
          error: {error || 'null'}
        </div>
      </div>
      <div className="mt-4 space-x-2">
        <Button
          onClick={connect}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {isLoading ? 'Connecting...' : 'Connect'}
        </Button>
        <Button
          onClick={disconnect}
          disabled={!isConnected}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Disconnect
        </Button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <h4 className="font-semibold text-red-800">Setup Required:</h4>
          <p className="text-sm text-red-700 mt-1">
            {error.includes('WalletConnect Project ID') ? (
              <>
                Please set up your WalletConnect Project ID. See{' '}
                <a href="/SETUP_HASHPACK.md" className="underline">
                  SETUP_HASHPACK.md
                </a>{' '}
                for instructions.
              </>
            ) : (
              'Connection failed. Check console for details.'
            )}
          </p>
        </div>
      )}
    </div>
  );
}
