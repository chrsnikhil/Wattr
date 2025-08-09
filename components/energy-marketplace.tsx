'use client';

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletTokens } from '@/hooks/use-wallet-tokens';
import { useUserRole } from '@/hooks/use-user-role';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sun,
  Zap,
  Wind,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Filter,
  Search,
  ExternalLink,
  Wallet,
  History,
  DollarSign,
  Battery,
  Home,
  Leaf,
} from 'lucide-react';

// Types for marketplace
interface EnergyListing {
  id: string;
  sellerId: string;
  sellerName?: string;
  energyAmount: number;
  pricePerKwh: number;
  totalPrice: number;
  location?: string;
  energySource: 'solar' | 'wind' | 'hydro' | 'other';
  timestamp: string;
  isActive: boolean;
  expiresAt?: string;
  verified?: boolean;
}

interface EnergyTrade {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  buyerName?: string;
  sellerName?: string;
  energyAmount: number;
  pricePerKwh: number;
  totalPrice: number;
  energySource: string;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timestamp: string;
  completedAt?: string;
  location?: string;
}

interface PurchaseResult {
  success: boolean;
  trade?: EnergyTrade;
  transactionId?: string;
  explorerUrl?: string;
  error?: string;
  mockMode?: boolean;
}

export default function EnergyMarketplace() {
  const { authenticated, user } = usePrivy();
  const { userProfile } = useUserRole();
  const {
    tokenInfo,
    loading: tokenLoading,
    fetchTokenInfo,
  } = useWalletTokens();

  // State management
  const [listings, setListings] = useState<EnergyListing[]>([]);
  const [userTrades, setUserTrades] = useState<EnergyTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');

  const walletAddress = user?.wallet?.address || '';

  // Fetch marketplace data
  const fetchMarketplaceData = async () => {
    try {
      setLoading(true);

      // Fetch active listings
      const listingsResponse = await fetch(
        '/api/energy-trading?action=listings',
      );
      const listingsData = await listingsResponse.json();

      if (listingsData.success) {
        setListings(listingsData.listings || []);
      }

      // Fetch user trades if authenticated
      if (authenticated && walletAddress) {
        // Get user's Hedera account ID first
        const walletResponse = await fetch(
          `/api/wallet-tokens?walletAddress=${encodeURIComponent(walletAddress)}&action=check-mapping`,
        );
        const walletData = await walletResponse.json();

        if (walletData.success && walletData.accountId) {
          const tradesResponse = await fetch(
            `/api/energy-trading?action=user-trades&accountId=${walletData.accountId}`,
          );
          const tradesData = await tradesResponse.json();

          if (tradesData.success) {
            setUserTrades(tradesData.trades || []);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
      setError('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  };

  // Purchase energy
  const handlePurchaseEnergy = async (listing: EnergyListing) => {
    if (!authenticated || !walletAddress) {
      setError('Please connect your wallet to purchase energy');
      return;
    }

    if (!tokenInfo) {
      setError('Unable to verify wallet token balance');
      return;
    }

    // Check if user has sufficient balance (assume 1 WEC = $1 for simplicity)
    if (tokenInfo.balance < listing.totalPrice) {
      setError(
        `Insufficient balance. You need ${listing.totalPrice.toFixed(2)} WEC but only have ${tokenInfo.balance.toFixed(2)} WEC`,
      );
      return;
    }

    try {
      setPurchasing(listing.id);
      setError(null);

      // Get user's Hedera account mapping
      const walletResponse = await fetch(
        `/api/wallet-tokens?walletAddress=${encodeURIComponent(walletAddress)}&action=check-mapping`,
      );
      const walletData = await walletResponse.json();

      if (!walletData.success || !walletData.accountId) {
        setError(
          'Wallet not mapped to Hedera account. Please complete setup first.',
        );
        return;
      }

      // Execute the energy trade
      const tradeResponse = await fetch('/api/energy-trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'execute-trade',
          listingId: listing.id,
          buyerId: walletData.accountId,
          buyerName: userProfile?.displayName || 'Anonymous Buyer',
        }),
      });

      const tradeData = await tradeResponse.json();

      if (tradeData.success) {
        setSuccess(
          `Successfully purchased ${listing.energyAmount} kWh for ${listing.totalPrice.toFixed(2)} WEC!`,
        );

        // Refresh data
        await Promise.all([fetchMarketplaceData(), fetchTokenInfo()]);

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(tradeData.error || 'Failed to complete purchase');
      }
    } catch (err) {
      console.error('Error purchasing energy:', err);
      setError('Failed to complete purchase. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  // Filter listings
  const filteredListings = listings.filter(listing => {
    const matchesSearch =
      listing.sellerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource =
      sourceFilter === 'all' || listing.energySource === sourceFilter;

    const matchesPrice =
      !maxPrice || listing.pricePerKwh <= parseFloat(maxPrice);

    const matchesLocation =
      !locationFilter ||
      listing.location?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesSource && matchesPrice && matchesLocation;
  });

  // Get icon for energy source
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'solar':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'wind':
        return <Wind className="h-5 w-5 text-blue-500" />;
      case 'hydro':
        return <Battery className="h-5 w-5 text-cyan-500" />;
      default:
        return <Zap className="h-5 w-5 text-[#10b981]" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  // Load data on mount
  useEffect(() => {
    fetchMarketplaceData();
  }, [authenticated, walletAddress]);

  // Fetch token info when wallet changes
  useEffect(() => {
    if (authenticated && walletAddress) {
      fetchTokenInfo();
    }
  }, [authenticated, walletAddress, fetchTokenInfo]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a5568_1px,transparent_1px),linear-gradient(90deg,#4a5568_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center p-6">
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568] max-w-md w-full">
          <CardHeader className="text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-[#10b981] mb-4" />
            <CardTitle className="text-2xl font-black font-mono text-black">
              CONNECT WALLET
            </CardTitle>
            <CardDescription className="text-base font-medium text-black">
              Connect your wallet to access the energy marketplace
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a5568_1px,transparent_1px),linear-gradient(90deg,#4a5568_1px,transparent_1px)] bg-[size:20px_20px] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Success/Error Messages */}
        {success && (
          <Alert className="bg-[#10b981] border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
            <CheckCircle className="h-6 w-6 text-white" />
            <AlertDescription className="font-black font-mono text-white text-lg">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="bg-red-100 border-4 border-red-500 shadow-[8px_8px_0px_0px_#4a5568]">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <AlertDescription className="font-black font-mono text-red-800 text-lg">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568] p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black font-mono text-black tracking-wider">
                  ENERGY MARKETPLACE
                </h1>
                <p className="text-lg font-bold font-mono text-[#4a5568]">
                  Buy Verified Renewable Energy Credits
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-sm font-bold font-mono text-black">
                  YOUR BALANCE
                </p>
                <p className="text-2xl font-black font-mono text-[#10b981]">
                  {tokenLoading ? (
                    <RefreshCw className="h-6 w-6 animate-spin inline" />
                  ) : (
                    `${tokenInfo?.balance?.toFixed(1) || '0.0'} WEC`
                  )}
                </p>
              </div>

              <Button
                onClick={() => {
                  fetchMarketplaceData();
                  fetchTokenInfo();
                }}
                disabled={loading || tokenLoading}
                className="bg-black hover:bg-[#2d3748] text-white font-black font-mono px-6 py-3 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
              >
                {loading || tokenLoading ? (
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-5 w-5" />
                )}
                REFRESH
              </Button>
            </div>
          </div>

          {/* Marketplace Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#10b981] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#4a5568]">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-white" />
                <div>
                  <p className="text-xl font-black font-mono text-white">
                    {filteredListings.length} LISTINGS
                  </p>
                  <p className="text-sm font-bold font-mono text-white opacity-90">
                    Available for Purchase
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-black border-4 border-black p-4 shadow-[4px_4px_0px_0px_#4a5568]">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-white" />
                <div>
                  <p className="text-xl font-black font-mono text-white">
                    {userTrades.filter(t => t.status === 'completed').length}{' '}
                    TRADES
                  </p>
                  <p className="text-sm font-bold font-mono text-white opacity-90">
                    Your Completed Purchases
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#4a5568] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#4a5568]">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-white" />
                <div>
                  <p className="text-xl font-black font-mono text-white">
                    100% VERIFIED
                  </p>
                  <p className="text-sm font-bold font-mono text-white opacity-90">
                    Guardian Authenticated
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] p-2 mb-6">
            <TabsTrigger
              value="marketplace"
              className="font-black font-mono data-[state=active]:bg-[#10b981] data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              MARKETPLACE
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="font-black font-mono data-[state=active]:bg-[#10b981] data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black"
            >
              <History className="h-4 w-4 mr-2" />
              YOUR TRADES
            </TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
              <CardHeader>
                <CardTitle className="text-xl font-black font-mono text-black flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  FILTER LISTINGS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-bold font-mono text-black mb-2 block">
                      SEARCH
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Seller or location..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-4 border-black text-black placeholder:text-gray-500 font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold font-mono text-black mb-2 block">
                      ENERGY SOURCE
                    </label>
                    <Select
                      value={sourceFilter}
                      onValueChange={setSourceFilter}
                    >
                      <SelectTrigger className="bg-white border-4 border-black text-black font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all">
                        <SelectValue placeholder="All sources" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-4 border-black">
                        <SelectItem value="all" className="font-mono font-bold">
                          ALL SOURCES
                        </SelectItem>
                        <SelectItem
                          value="solar"
                          className="font-mono font-bold"
                        >
                          SOLAR
                        </SelectItem>
                        <SelectItem
                          value="wind"
                          className="font-mono font-bold"
                        >
                          WIND
                        </SelectItem>
                        <SelectItem
                          value="hydro"
                          className="font-mono font-bold"
                        >
                          HYDRO
                        </SelectItem>
                        <SelectItem
                          value="other"
                          className="font-mono font-bold"
                        >
                          OTHER
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-bold font-mono text-black mb-2 block">
                      MAX PRICE ($/kWh)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.20"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      className="bg-white border-4 border-black text-black placeholder:text-gray-500 font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold font-mono text-black mb-2 block">
                      LOCATION
                    </label>
                    <Input
                      placeholder="City, State..."
                      value={locationFilter}
                      onChange={e => setLocationFilter(e.target.value)}
                      className="bg-white border-4 border-black text-black placeholder:text-gray-500 font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Energy Listings */}
            {loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-[#10b981]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map(listing => (
                  <Card
                    key={listing.id}
                    className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(listing.energySource)}
                          <Badge className="bg-[#10b981] text-white border-2 border-black font-black font-mono">
                            {listing.energySource.toUpperCase()}
                          </Badge>
                        </div>
                        <Badge className="bg-black text-white border-2 border-black font-black font-mono">
                          <Shield className="h-3 w-3 mr-1" />
                          VERIFIED
                        </Badge>
                      </div>

                      <CardTitle className="text-xl font-black font-mono text-black">
                        {listing.sellerName || 'Anonymous Seller'}
                      </CardTitle>

                      {listing.location && (
                        <div className="flex items-center gap-1 text-sm font-bold font-mono text-[#4a5568]">
                          <MapPin className="h-4 w-4" />
                          {listing.location}
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Energy Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-bold font-mono text-[#4a5568]">
                            AMOUNT
                          </p>
                          <p className="text-2xl font-black font-mono text-black">
                            {listing.energyAmount} kWh
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-bold font-mono text-[#4a5568]">
                            PRICE/kWh
                          </p>
                          <p className="text-2xl font-black font-mono text-black">
                            ${listing.pricePerKwh.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="bg-[#10b981] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#4a5568]">
                        <p className="text-lg font-black font-mono text-white text-center">
                          TOTAL: {listing.totalPrice.toFixed(2)} WEC
                        </p>
                      </div>

                      {/* Listing Info */}
                      <div className="flex items-center justify-between text-xs font-bold font-mono text-[#4a5568]">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Listed {formatTimeAgo(listing.timestamp)}
                        </div>
                        {listing.expiresAt && (
                          <div>
                            Expires in{' '}
                            {Math.floor(
                              (new Date(listing.expiresAt).getTime() -
                                Date.now()) /
                                (1000 * 60 * 60),
                            )}
                            h
                          </div>
                        )}
                      </div>

                      {/* Purchase Button */}
                      <Button
                        onClick={() => handlePurchaseEnergy(listing)}
                        disabled={
                          purchasing === listing.id ||
                          !tokenInfo ||
                          tokenInfo.balance < listing.totalPrice
                        }
                        className="w-full bg-black hover:bg-[#2d3748] text-white font-black font-mono py-3 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
                      >
                        {purchasing === listing.id ? (
                          <>
                            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                            PURCHASING...
                          </>
                        ) : tokenInfo &&
                          tokenInfo.balance < listing.totalPrice ? (
                          <>
                            <Wallet className="mr-2 h-5 w-5" />
                            INSUFFICIENT BALANCE
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            BUY ENERGY
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Listings */}
            {!loading && filteredListings.length === 0 && (
              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-300 border-4 border-black mx-auto mb-4 flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                    <ShoppingCart className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-xl font-black font-mono text-black mb-2">
                    NO LISTINGS FOUND
                  </p>
                  <p className="text-base font-medium text-[#4a5568]">
                    Try adjusting your filters or check back later
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* User Trades Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
              <CardHeader>
                <CardTitle className="text-xl font-black font-mono text-black">
                  YOUR PURCHASE HISTORY
                </CardTitle>
                <CardDescription className="text-base font-medium text-black">
                  All your energy trading transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userTrades.length > 0 ? (
                  <div className="space-y-4">
                    {userTrades.map(trade => (
                      <div
                        key={trade.id}
                        className="bg-[#f5f5f5] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#4a5568]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {getSourceIcon(trade.energySource)}
                            <div>
                              <p className="text-lg font-black font-mono text-black">
                                {trade.energyAmount} kWh from{' '}
                                {trade.sellerName || 'Anonymous'}
                              </p>
                              <p className="text-sm font-bold font-mono text-[#4a5568]">
                                {formatTimeAgo(trade.timestamp)} • Total:{' '}
                                {trade.totalPrice.toFixed(2)} WEC
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <Badge
                              className={`border-2 border-black font-black font-mono ${
                                trade.status === 'completed'
                                  ? 'bg-[#10b981] text-white'
                                  : trade.status === 'pending'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-red-500 text-white'
                              }`}
                            >
                              {trade.status.toUpperCase()}
                            </Badge>
                            {trade.transactionId && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white border-2 border-black text-black hover:bg-gray-100 font-black font-mono shadow-[2px_2px_0px_0px_#4a5568] hover:shadow-[4px_4px_0px_0px_#4a5568] transition-all"
                                onClick={() =>
                                  window.open(
                                    `https://hashscan.io/testnet/transaction/${trade.transactionId}`,
                                    '_blank',
                                  )
                                }
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                VIEW
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-300 border-4 border-black mx-auto mb-4 flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                      <History className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-lg font-black font-mono text-black">
                      NO TRADES YET
                    </p>
                    <p className="text-sm font-bold font-mono text-[#4a5568]">
                      Start by purchasing energy from the marketplace
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
