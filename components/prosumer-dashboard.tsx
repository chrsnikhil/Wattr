'use client';

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartMeter } from '@/hooks/use-smart-meter';
import { useUserRole } from '@/hooks/use-user-role';
import { useWalletTokens } from '@/hooks/use-wallet-tokens';
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
import { Progress } from '@/components/ui/progress';
import {
  Sun,
  Zap,
  Battery,
  TrendingUp,
  TrendingDown,
  Shield,
  CheckCircle,
  AlertTriangle,
  Plus,
  Wallet,
  ArrowRight,
  MapPin,
  Clock,
  RefreshCw,
  Settings,
  Target,
  DollarSign,
  Activity,
  BarChart3,
  Wind,
  Home,
} from 'lucide-react';

interface EnergyData {
  production: number;
  consumption: number;
  excess: number;
  dailyProduction: number;
  weeklyProduction: number;
  monthlyProduction: number;
  carbonOffset: number;
  guardianVerified: boolean;
  lastVerification: string;
}

interface EnergyListing {
  id: string;
  amount: number;
  pricePerKwh: number;
  totalPrice: number;
  status: 'active' | 'sold' | 'expired';
  listedAt: string;
  expiresAt: string;
}

export default function ProsumerDashboard() {
  const { authenticated, user } = usePrivy();
  const { userProfile, hasPermission } = useUserRole();
  const {
    data: smartMeterData,
    loading: smartMeterLoading,
    error: smartMeterError,
    refresh: refreshSmartMeter,
    getTotalEnergy,
    getEnergyBySource,
    lastUpdate,
  } = useSmartMeter({
    autoRefresh: true,
    refreshInterval: 30000,
  });

  // Real wallet token balance
  const {
    tokenInfo,
    loading: tokenLoading,
    error: tokenError,
    fetchTokenInfo,
  } = useWalletTokens();

  // State management
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [listings, setListings] = useState<EnergyListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New listing form state
  const [showListingForm, setShowListingForm] = useState(false);
  const [listingAmount, setListingAmount] = useState('');
  const [listingPrice, setListingPrice] = useState('');

  const walletAddress = user?.wallet?.address || '';

  // Fetch token info on mount and when wallet changes
  useEffect(() => {
    if (authenticated && walletAddress) {
      fetchTokenInfo();
    }
  }, [authenticated, walletAddress, fetchTokenInfo]);

  // Mock energy data calculation from smart meter
  useEffect(() => {
    if (smartMeterData?.data) {
      const totalProduction = getTotalEnergy();
      const mockConsumption = totalProduction * 0.3; // 30% consumption
      const excess = Math.max(0, totalProduction - mockConsumption);

      const mockEnergyData: EnergyData = {
        production: totalProduction,
        consumption: mockConsumption,
        excess: excess,
        dailyProduction: totalProduction * 0.15, // Mock daily breakdown
        weeklyProduction: totalProduction * 0.6,
        monthlyProduction: totalProduction,
        carbonOffset: totalProduction * 0.4, // kg CO2 saved
        guardianVerified: true, // Mock Guardian verification
        lastVerification: new Date().toISOString(),
      };

      setEnergyData(mockEnergyData);
    }
  }, [smartMeterData, getTotalEnergy]);

  // Mock listings data
  useEffect(() => {
    const mockListings: EnergyListing[] = [
      {
        id: 'listing-1',
        amount: 15.5,
        pricePerKwh: 0.12,
        totalPrice: 1.86,
        status: 'active',
        listedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'listing-2',
        amount: 8.2,
        pricePerKwh: 0.15,
        totalPrice: 1.23,
        status: 'active',
        listedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
      },
    ];
    setListings(mockListings);
  }, []);

  const handleCreateListing = async () => {
    if (!listingAmount || !listingPrice) {
      setError('Please fill in all fields');
      return;
    }

    const amount = parseFloat(listingAmount);
    const pricePerKwh = parseFloat(listingPrice);

    if (amount <= 0 || pricePerKwh <= 0) {
      setError('Amount and price must be positive numbers');
      return;
    }

    if (energyData && amount > energyData.excess) {
      setError(
        `Cannot list more than available excess energy (${energyData.excess.toFixed(1)} kWh)`,
      );
      return;
    }

    if (!authenticated || !walletAddress) {
      setError('Please connect your wallet to create a listing');
      return;
    }

    setLoading(true);
    try {
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

      // Create real listing via API
      const listingResponse = await fetch('/api/energy-trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-listing',
          sellerId: walletData.accountId,
          sellerName: userProfile?.displayName || 'Anonymous Seller',
          energyAmount: amount,
          pricePerKwh: pricePerKwh,
          energySource: 'solar', // Default to solar, could be made configurable
          location: 'Unknown Location', // Default location since userProfile doesn't have location
          expiresInHours: 24,
        }),
      });

      const listingData = await listingResponse.json();

      if (listingData.success) {
        setListingAmount('');
        setListingPrice('');
        setShowListingForm(false);
        setSuccess(
          `Successfully listed ${amount} kWh for ${(amount * pricePerKwh).toFixed(2)} WEC. Your listing is now available in the marketplace!`,
        );

        // Refresh token balance after listing creation
        fetchTokenInfo();

        // Refresh local listings display (could be enhanced to fetch real user listings)
        const newListing: EnergyListing = {
          id: listingData.listing?.id || `listing-${Date.now()}`,
          amount,
          pricePerKwh,
          totalPrice: amount * pricePerKwh,
          status: 'active',
          listedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
        setListings(prev => [newListing, ...prev]);

        setTimeout(() => setSuccess(null), 7000);
      } else {
        setError(listingData.error || 'Failed to create listing');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      setError('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'solar':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'wind':
        return <Wind className="h-4 w-4 text-blue-500" />;
      case 'grid':
        return <Home className="h-4 w-4 text-gray-500" />;
      default:
        return <Zap className="h-4 w-4 text-[#10b981]" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a5568_1px,transparent_1px),linear-gradient(90deg,#4a5568_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center p-6">
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568] max-w-md w-full">
          <CardHeader className="text-center">
            <Sun className="h-16 w-16 mx-auto text-[#10b981] mb-4" />
            <CardTitle className="text-2xl font-black font-mono text-black">
              CONNECT WALLET
            </CardTitle>
            <CardDescription className="text-base font-medium text-black">
              Connect your wallet to access the prosumer dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-[#10b981] border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
          <CheckCircle className="h-6 w-6 text-white" />
          <AlertDescription className="font-black font-mono text-white text-lg">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {(error || tokenError) && (
        <Alert className="bg-red-100 border-4 border-red-500 shadow-[8px_8px_0px_0px_#4a5568]">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          <AlertDescription className="font-black font-mono text-red-800 text-lg">
            {error || tokenError}
          </AlertDescription>
        </Alert>
      )}

      {/* Header Section */}
      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568] p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
              <Sun className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black font-mono text-black tracking-wider">
                PROSUMER DASHBOARD
              </h1>
              <p className="text-lg font-bold font-mono text-[#4a5568]">
                Energy Production & Trading Hub
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              refreshSmartMeter();
              fetchTokenInfo();
            }}
            disabled={smartMeterLoading || tokenLoading}
            className="bg-black hover:bg-[#2d3748] text-white font-black font-mono px-6 py-3 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
          >
            {smartMeterLoading || tokenLoading ? (
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-5 w-5" />
            )}
            REFRESH DATA
          </Button>
        </div>

        {/* Guardian Verification Status */}
        {energyData && (
          <div className="bg-[#10b981] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#4a5568]">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-white" />
              <div>
                <p className="text-xl font-black font-mono text-white">
                  HEDERA GUARDIAN: VERIFIED ✓
                </p>
                <p className="text-sm font-bold font-mono text-white opacity-90">
                  Last verification:{' '}
                  {formatTimeAgo(energyData.lastVerification)} • Carbon offset:{' '}
                  {energyData.carbonOffset.toFixed(1)} kg CO₂
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Energy Overview Cards */}
      {energyData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Production */}
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black font-mono text-black">
                  TODAY'S SOLAR
                </CardTitle>
                <div className="w-12 h-12 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                  <Sun className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black font-mono text-black mb-2">
                {energyData.dailyProduction.toFixed(1)} kWh
              </div>
              <p className="text-sm font-bold font-mono text-[#10b981]">
                GENERATED TODAY
              </p>
            </CardContent>
          </Card>

          {/* Consumption */}
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black font-mono text-black">
                  CONSUMPTION
                </CardTitle>
                <div className="w-12 h-12 bg-red-500 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black font-mono text-black mb-2">
                {energyData.consumption.toFixed(1)} kWh
              </div>
              <p className="text-sm font-bold font-mono text-red-600">
                USED TODAY
              </p>
            </CardContent>
          </Card>

          {/* Excess Energy */}
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black font-mono text-black">
                  EXCESS ENERGY
                </CardTitle>
                <div className="w-12 h-12 bg-blue-500 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                  <Battery className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black font-mono text-black mb-2">
                {energyData.excess.toFixed(1)} kWh
              </div>
              <p className="text-sm font-bold font-mono text-blue-600">
                AVAILABLE TO SELL
              </p>
            </CardContent>
          </Card>

          {/* Energy Credits */}
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black font-mono text-black">
                  ENERGY CREDITS
                </CardTitle>
                <div className="w-12 h-12 bg-black border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black font-mono text-black mb-2">
                {tokenLoading ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    Loading...
                  </div>
                ) : (
                  `${tokenInfo?.balance?.toFixed(1) || '0.0'} WEC`
                )}
              </div>
              <p className="text-sm font-bold font-mono text-[#4a5568]">
                TOKEN BALANCE {tokenInfo?.mockMode ? '(MOCK)' : '(LIVE)'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] p-2 mb-6">
          <TabsTrigger
            value="overview"
            className="font-black font-mono data-[state=active]:bg-[#10b981] data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            OVERVIEW
          </TabsTrigger>
          <TabsTrigger
            value="marketplace"
            className="font-black font-mono data-[state=active]:bg-[#10b981] data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            ENERGY MARKETPLACE
          </TabsTrigger>
          <TabsTrigger
            value="production"
            className="font-black font-mono data-[state=active]:bg-[#10b981] data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black"
          >
            <Activity className="h-4 w-4 mr-2" />
            PRODUCTION DATA
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {energyData && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Production Chart */}
              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
                <CardHeader>
                  <CardTitle className="text-xl font-black font-mono text-black">
                    PRODUCTION BREAKDOWN
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold font-mono text-black">
                          DAILY
                        </span>
                        <span className="text-sm font-bold font-mono text-[#10b981]">
                          {energyData.dailyProduction.toFixed(1)} kWh
                        </span>
                      </div>
                      <Progress
                        value={
                          (energyData.dailyProduction /
                            energyData.monthlyProduction) *
                          100
                        }
                        className="bg-gray-300 border-2 border-black"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold font-mono text-black">
                          WEEKLY
                        </span>
                        <span className="text-sm font-bold font-mono text-[#10b981]">
                          {energyData.weeklyProduction.toFixed(1)} kWh
                        </span>
                      </div>
                      <Progress
                        value={
                          (energyData.weeklyProduction /
                            energyData.monthlyProduction) *
                          100
                        }
                        className="bg-gray-300 border-2 border-black"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold font-mono text-black">
                          MONTHLY
                        </span>
                        <span className="text-sm font-bold font-mono text-[#10b981]">
                          {energyData.monthlyProduction.toFixed(1)} kWh
                        </span>
                      </div>
                      <Progress
                        value={100}
                        className="bg-gray-300 border-2 border-black"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
                <CardHeader>
                  <CardTitle className="text-xl font-black font-mono text-black">
                    QUICK ACTIONS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => setShowListingForm(true)}
                    disabled={energyData.excess <= 0}
                    className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    LIST EXCESS ENERGY FOR SALE
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="bg-white border-4 border-black text-black hover:bg-gray-100 font-black font-mono py-3 shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      SETTINGS
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-white border-4 border-black text-black hover:bg-gray-100 font-black font-mono py-3 shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      ANALYTICS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-6">
          {/* Create Listing Form */}
          {showListingForm && (
            <Card className="bg-white border-4 border-[#10b981] shadow-[8px_8px_0px_0px_#4a5568]">
              <CardHeader>
                <CardTitle className="text-xl font-black font-mono text-black">
                  CREATE NEW ENERGY LISTING
                </CardTitle>
                <CardDescription className="text-base font-medium text-black">
                  List your excess energy for sale to other grid participants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-black font-mono text-black mb-2 block">
                      ENERGY AMOUNT (kWh)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter kWh amount"
                      value={listingAmount}
                      onChange={e => setListingAmount(e.target.value)}
                      className="bg-white border-4 border-black text-black placeholder:text-gray-500 font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                    />
                    {energyData && (
                      <p className="text-xs font-bold font-mono text-[#4a5568] mt-1">
                        Available: {energyData.excess.toFixed(1)} kWh
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-black font-mono text-black mb-2 block">
                      PRICE PER kWh ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.12"
                      value={listingPrice}
                      onChange={e => setListingPrice(e.target.value)}
                      className="bg-white border-4 border-black text-black placeholder:text-gray-500 font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                    />
                    <p className="text-xs font-bold font-mono text-[#4a5568] mt-1">
                      Market average: $0.12/kWh
                    </p>
                  </div>
                </div>

                {listingAmount && listingPrice && (
                  <div className="bg-[#10b981] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#4a5568]">
                    <p className="text-xl font-black font-mono text-white">
                      TOTAL LISTING VALUE: $
                      {(
                        parseFloat(listingAmount) * parseFloat(listingPrice)
                      ).toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateListing}
                    disabled={loading || !listingAmount || !listingPrice}
                    className="bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-6 py-3 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
                  >
                    {loading ? (
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-5 w-5" />
                    )}
                    CREATE LISTING
                  </Button>
                  <Button
                    onClick={() => setShowListingForm(false)}
                    variant="outline"
                    className="bg-white border-4 border-black text-black hover:bg-gray-100 font-black font-mono px-6 py-3 shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                  >
                    CANCEL
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Listings */}
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-black font-mono text-black">
                  YOUR ACTIVE LISTINGS
                </CardTitle>
                {!showListingForm && (
                  <Button
                    onClick={() => setShowListingForm(true)}
                    className="bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    NEW LISTING
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {listings.length > 0 ? (
                <div className="space-y-4">
                  {listings.map(listing => (
                    <div
                      key={listing.id}
                      className="bg-[#f5f5f5] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#4a5568]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#4a5568]">
                            <Zap className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-lg font-black font-mono text-black">
                              {listing.amount} kWh @ ${listing.pricePerKwh}/kWh
                            </p>
                            <p className="text-sm font-bold font-mono text-[#4a5568]">
                              Listed {formatTimeAgo(listing.listedAt)} • Expires
                              in{' '}
                              {Math.floor(
                                (new Date(listing.expiresAt).getTime() -
                                  Date.now()) /
                                  (1000 * 60 * 60),
                              )}
                              h
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black font-mono text-black">
                            ${listing.totalPrice.toFixed(2)}
                          </p>
                          <Badge className="bg-[#10b981] text-white border-2 border-black font-black font-mono">
                            ACTIVE
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-300 border-4 border-black mx-auto mb-4 flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                    <DollarSign className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-lg font-black font-mono text-black">
                    NO ACTIVE LISTINGS
                  </p>
                  <p className="text-sm font-bold font-mono text-[#4a5568] mb-4">
                    Create your first energy listing to start earning
                  </p>
                  <Button
                    onClick={() => setShowListingForm(true)}
                    className="bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-6 py-3 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    CREATE FIRST LISTING
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Production Data Tab */}
        <TabsContent value="production" className="space-y-6">
          {smartMeterData?.data && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Real-time Readings */}
              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
                <CardHeader>
                  <CardTitle className="text-xl font-black font-mono text-black">
                    REAL-TIME SMART METER DATA
                  </CardTitle>
                  <CardDescription className="text-base font-medium text-black">
                    Live data from NREL Solar Resource API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {smartMeterData.data.slice(0, 3).map((reading, index) => (
                    <div
                      key={index}
                      className="bg-[#f5f5f5] border-4 border-black p-4 shadow-[4px_4px_0px_0px_#4a5568]"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {getSourceIcon(reading.source)}
                        <div>
                          <p className="text-lg font-black font-mono text-black">
                            {reading.energyAmount.toFixed(1)} kWh
                          </p>
                          <p className="text-sm font-bold font-mono text-[#4a5568]">
                            {reading.source.toUpperCase()} • {reading.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#10b981]" />
                        <span className="text-sm font-bold font-mono text-[#10b981]">
                          VERIFIED BY GUARDIAN
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
                <CardHeader>
                  <CardTitle className="text-xl font-black font-mono text-black">
                    SYSTEM STATUS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#10b981] border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                      <span className="text-sm font-bold font-mono text-white">
                        SMART METER
                      </span>
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#10b981] border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                      <span className="text-sm font-bold font-mono text-white">
                        GUARDIAN VERIFICATION
                      </span>
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#10b981] border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                      <span className="text-sm font-bold font-mono text-white">
                        TOKEN MINTING
                      </span>
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#10b981] border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                      <span className="text-sm font-bold font-mono text-white">
                        MARKETPLACE ACCESS
                      </span>
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="bg-black border-4 border-black p-4 shadow-[4px_4px_0px_0px_#4a5568]">
                    <p className="text-sm font-bold font-mono text-white">
                      LAST UPDATE:{' '}
                      {lastUpdate
                        ? new Date(lastUpdate).toLocaleTimeString()
                        : 'N/A'}
                    </p>
                    <p className="text-sm font-bold font-mono text-white">
                      TOTAL READINGS: {smartMeterData.totalReadings}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
