'use client';

import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSmartMeter } from '@/hooks/use-smart-meter';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import ConnectWalletButton from '@/components/connect-wallet-button';
import {
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Battery,
  Sun,
  Home,
  Factory,
  Wind,
  CheckCircle,
  AlertTriangle,
  Plus,
  BarChart3,
  Gauge,
  Wallet,
  MapPin,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface EnergyReading {
  meterId: string;
  accountId: string;
  meterType: 'production' | 'consumption';
  energyAmount: number;
  energySource: string;
  timestamp: string;
  verified: boolean;
  verificationSource: string;
  location: string;
  meterSerialNumber: string;
}

interface MeteringStats {
  totalProduction: number;
  totalConsumption: number;
  totalTokensMinted: number;
  totalTokensBurned: number;
  netTokens: number;
  totalMeters: number;
  totalReadings: number;
}

export default function EnergyMeteringDashboard() {
  const { authenticated, user } = usePrivy();

  // Smart meter hook for real-time data
  const {
    data: smartMeterData,
    loading: smartMeterLoading,
    error: smartMeterError,
    refresh: refreshSmartMeter,
    getTotalEnergy,
    getEnergyBySource,
    getVerifiedReadings,
    lastUpdate,
  } = useSmartMeter({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  });

  const [readings, setReadings] = useState<EnergyReading[]>([]);
  const [stats, setStats] = useState<MeteringStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get wallet address for user operations
  const walletAddress = user?.wallet?.address || '';

  // Convert smart meter data to our local format
  useEffect(() => {
    if (smartMeterData?.data) {
      const convertedReadings: EnergyReading[] = smartMeterData.data.map(
        (reading, index) => ({
          meterId: `METER-${reading.userId}`,
          accountId: walletAddress || reading.userId,
          meterType: 'production' as const,
          energyAmount: reading.energyAmount,
          energySource: reading.source,
          timestamp: reading.timestamp,
          verified: reading.verified,
          verificationSource: reading.dataSource || 'NREL Solar Resource API',
          location: reading.location,
          meterSerialNumber: `SM-${reading.userId}-${index}`,
        }),
      );

      setReadings(convertedReadings);

      // Calculate stats from smart meter data
      const totalProduction = getTotalEnergy();

      const calculatedStats: MeteringStats = {
        totalProduction,
        totalConsumption: totalProduction * 0.3, // Mock consumption as 30% of production
        totalTokensMinted: Math.floor(totalProduction),
        totalTokensBurned: Math.floor(totalProduction * 0.3),
        netTokens: Math.floor(totalProduction * 0.7),
        totalMeters: smartMeterData.data.length,
        totalReadings: smartMeterData.totalReadings,
      };

      setStats(calculatedStats);
    }
  }, [
    smartMeterData,
    walletAddress,
    getTotalEnergy,
    getEnergyBySource,
    getVerifiedReadings,
  ]);

  // Set smart meter errors
  useEffect(() => {
    if (smartMeterError) {
      setError(`Smart Meter API Error: ${smartMeterError}`);
    } else {
      setError(null);
    }
  }, [smartMeterError]);

  // Manual refresh function
  const refreshData = async () => {
    setLoading(true);
    try {
      await refreshSmartMeter();
      setSuccess('Energy data refreshed successfully from NREL API!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to refresh data: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const getMeterTypeIcon = (type: 'production' | 'consumption') => {
    return type === 'production' ? (
      <TrendingUp className="h-6 w-6 text-[#10b981]" />
    ) : (
      <TrendingDown className="h-6 w-6 text-red-500" />
    );
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
        return <Factory className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a5568_1px,transparent_1px),linear-gradient(90deg,#4a5568_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center p-6">
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568] max-w-md w-full">
          <CardHeader className="text-center">
            <Gauge className="h-16 w-16 mx-auto text-[#10b981] mb-4" />
            <CardTitle className="text-2xl font-black font-mono text-black">
              CONNECT WALLET
            </CardTitle>
            <CardDescription className="text-base font-medium text-black">
              Connect your wallet to access the energy metering dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ConnectWalletButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a5568_1px,transparent_1px),linear-gradient(90deg,#4a5568_1px,transparent_1px)] bg-[size:20px_20px] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_#4a5568]">
              <Gauge className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black font-mono text-black tracking-wider">
                ENERGY METERING
              </h1>
              <p className="text-lg font-bold font-mono text-black">
                LIVE NREL SOLAR DATA & TOKEN MANAGEMENT
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#4a5568]">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-black" />
                <span className="font-black font-mono text-black text-sm">
                  {walletAddress
                    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                    : 'NOT CONNECTED'}
                </span>
              </div>
            </div>
            <ConnectWalletButton />
          </div>
        </div>

        {error && (
          <Alert className="bg-red-100 border-4 border-red-500 shadow-[8px_8px_0px_0px_#4a5568]">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <AlertDescription className="font-black font-mono text-red-800 text-lg">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-[#10b981] border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
            <CheckCircle className="h-6 w-6 text-white" />
            <AlertDescription className="font-black font-mono text-white text-lg">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-black font-mono text-black">
                    PRODUCTION
                  </CardTitle>
                  <TrendingUp className="h-6 w-6 text-[#10b981]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-mono text-black">
                  {stats.totalProduction.toFixed(1)} kWh
                </div>
                <p className="text-sm font-bold font-mono text-[#4a5568]">
                  {stats.totalTokensMinted} TOKENS MINTED
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-black font-mono text-black">
                    CONSUMPTION
                  </CardTitle>
                  <TrendingDown className="h-6 w-6 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-mono text-black">
                  {stats.totalConsumption.toFixed(1)} kWh
                </div>
                <p className="text-sm font-bold font-mono text-[#4a5568]">
                  {stats.totalTokensBurned} TOKENS BURNED
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-black font-mono text-black">
                    NET BALANCE
                  </CardTitle>
                  <Battery className="h-6 w-6 text-[#10b981]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-mono text-black">
                  {stats.netTokens} TOKENS
                </div>
                <p className="text-sm font-bold font-mono text-[#4a5568]">
                  ENERGY CREDITS
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-black font-mono text-black">
                    READINGS
                  </CardTitle>
                  <Activity className="h-6 w-6 text-[#10b981]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-mono text-black">
                  {stats.totalReadings}
                </div>
                <p className="text-sm font-bold font-mono text-[#4a5568]">
                  FROM {stats.totalMeters} METERS
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
          <Tabs defaultValue="readings" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#f5f5f5] border-b-4 border-black p-2">
              <TabsTrigger
                value="readings"
                className="font-black font-mono text-black data-[state=active]:bg-[#10b981] data-[state=active]:text-white border-2 border-black data-[state=active]:shadow-[2px_2px_0px_0px_#4a5568]"
              >
                LIVE READINGS
              </TabsTrigger>
              <TabsTrigger
                value="refresh"
                className="font-black font-mono text-black data-[state=active]:bg-[#10b981] data-[state=active]:text-white border-2 border-black data-[state=active]:shadow-[2px_2px_0px_0px_#4a5568]"
              >
                REFRESH DATA
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="font-black font-mono text-black data-[state=active]:bg-[#10b981] data-[state=active]:text-white border-2 border-black data-[state=active]:shadow-[2px_2px_0px_0px_#4a5568]"
              >
                ANALYTICS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="readings" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-[#10b981]" />
                  <div>
                    <h2 className="text-2xl font-black font-mono text-black">
                      LIVE ENERGY READINGS
                    </h2>
                    <p className="font-bold font-mono text-[#4a5568]">
                      REAL-TIME NREL SOLAR DATA WITH AUTOMATED TOKEN PROCESSING
                    </p>
                  </div>
                </div>

                {smartMeterLoading && (
                  <div className="bg-[#10b981] border-4 border-black p-4">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-6 w-6 text-white animate-spin" />
                      <p className="font-black font-mono text-white text-lg">
                        UPDATING ENERGY DATA FROM NREL API...
                      </p>
                    </div>
                  </div>
                )}

                {(readings || []).length === 0 ? (
                  <div className="text-center py-16 bg-[#f5f5f5] border-4 border-[#4a5568] rounded-lg">
                    <Gauge className="h-16 w-16 mx-auto text-[#4a5568] mb-4" />
                    <p className="text-xl font-black font-mono text-black mb-2">
                      NO ENERGY READINGS AVAILABLE
                    </p>
                    <p className="font-bold font-mono text-[#4a5568] mb-4">
                      WAITING FOR SMART METER DATA FROM NREL API
                    </p>
                    <Button
                      onClick={refreshData}
                      disabled={loading || smartMeterLoading}
                      className="bg-black hover:bg-[#2d3748] text-white font-black font-mono px-6 py-3 border-4 border-black shadow-[6px_6px_0px_0px_#4a5568] hover:shadow-[8px_8px_0px_0px_#4a5568] transition-all"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      REFRESH DATA
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {(readings || []).map((reading, index) => (
                      <Card
                        key={index}
                        className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#4a5568]"
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                              {getMeterTypeIcon(reading.meterType)}
                              <div>
                                <h3 className="text-xl font-black font-mono text-black">
                                  METER: {reading.meterId}
                                </h3>
                                <p className="font-bold font-mono text-[#4a5568]">
                                  {new Date(reading.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-2">
                                {reading.verified && (
                                  <Badge className="bg-[#10b981] text-white border-2 border-black font-black font-mono">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    VERIFIED
                                  </Badge>
                                )}
                                <Badge
                                  className={`font-black font-mono px-3 py-1 border-2 border-black ${
                                    reading.meterType === 'production'
                                      ? 'bg-[#10b981] text-white'
                                      : 'bg-red-500 text-white'
                                  }`}
                                >
                                  {reading.meterType.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-[#f5f5f5] border-2 border-black p-3">
                              <p className="text-xs font-black font-mono text-[#4a5568]">
                                ENERGY AMOUNT
                              </p>
                              <p className="text-lg font-black font-mono text-black">
                                {reading.energyAmount} kWh
                              </p>
                            </div>
                            <div className="bg-[#f5f5f5] border-2 border-black p-3">
                              <p className="text-xs font-black font-mono text-[#4a5568]">
                                SOURCE
                              </p>
                              <div className="flex items-center gap-2">
                                {getSourceIcon(reading.energySource)}
                                <span className="text-lg font-black font-mono text-black uppercase">
                                  {reading.energySource}
                                </span>
                              </div>
                            </div>
                            <div className="bg-[#f5f5f5] border-2 border-black p-3">
                              <p className="text-xs font-black font-mono text-[#4a5568]">
                                LOCATION
                              </p>
                              <p className="text-sm font-black font-mono text-black">
                                {reading.location || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-[#f5f5f5] border-2 border-black p-3">
                              <p className="text-xs font-black font-mono text-[#4a5568]">
                                SERIAL NUMBER
                              </p>
                              <p className="text-sm font-black font-mono text-black">
                                {reading.meterSerialNumber || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge className="bg-white text-black border-2 border-black font-black font-mono">
                                <Clock className="h-3 w-3 mr-1" />
                                ACCOUNT: {reading.accountId.slice(0, 8)}...
                              </Badge>
                              <Badge className="bg-white text-black border-2 border-black font-black font-mono">
                                VERIFIED BY: {reading.verificationSource}
                              </Badge>
                            </div>
                            <div className="bg-[#10b981] border-2 border-black p-2">
                              <p className="font-black font-mono text-white text-sm">
                                TOKEN ACTION:{' '}
                                {reading.meterType === 'production'
                                  ? 'MINTED'
                                  : 'BURNED'}{' '}
                                {reading.energyAmount} TOKENS
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="refresh" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-8 w-8 text-[#10b981]" />
                  <div>
                    <h2 className="text-2xl font-black font-mono text-black">
                      REFRESH SMART METER DATA
                    </h2>
                    <p className="font-bold font-mono text-[#4a5568]">
                      UPDATE REAL-TIME NREL SOLAR DATA AND SYSTEM STATUS
                    </p>
                  </div>
                </div>

                <div className="bg-[#f5f5f5] border-4 border-black p-6 space-y-6">
                  {smartMeterData && (
                    <div className="bg-[#10b981] border-4 border-black p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="h-6 w-6 text-white" />
                        <div>
                          <p className="font-black font-mono text-white text-lg">
                            SMART METER STATUS: ACTIVE
                          </p>
                          <p className="font-bold font-mono text-white">
                            DATA SOURCE:{' '}
                            {smartMeterData.metadata?.dataSource || 'NREL API'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white font-bold font-mono">
                        <div>
                          <p className="text-sm opacity-90">TOTAL READINGS</p>
                          <p className="text-xl">
                            {smartMeterData.totalReadings}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm opacity-90">
                            VERIFIED READINGS
                          </p>
                          <p className="text-xl">
                            {getVerifiedReadings().length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm opacity-90">TOTAL ENERGY</p>
                          <p className="text-xl">
                            {getTotalEnergy().toFixed(1)} kWh
                          </p>
                        </div>
                        <div>
                          <p className="text-sm opacity-90">LAST UPDATE</p>
                          <p className="text-sm">
                            {lastUpdate
                              ? new Date(lastUpdate).toLocaleTimeString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {smartMeterError && (
                    <div className="bg-red-100 border-4 border-red-500 p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        <div>
                          <p className="font-black font-mono text-red-800 text-lg">
                            SMART METER CONNECTION ERROR
                          </p>
                          <p className="font-bold font-mono text-red-600">
                            {smartMeterError}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border-4 border-black p-4">
                      <h4 className="text-lg font-black font-mono text-black mb-3">
                        AUTO-REFRESH STATUS
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-bold font-mono text-black">
                            Interval:
                          </span>
                          <span className="font-black font-mono text-[#10b981]">
                            30 seconds
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold font-mono text-black">
                            Status:
                          </span>
                          <Badge className="bg-[#10b981] text-white border-2 border-black font-black font-mono">
                            {smartMeterLoading ? 'UPDATING' : 'ACTIVE'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold font-mono text-black">
                            Data Source:
                          </span>
                          <span className="font-black font-mono text-black text-sm">
                            NREL Solar API
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-4 border-black p-4">
                      <h4 className="text-lg font-black font-mono text-black mb-3">
                        MANUAL REFRESH
                      </h4>
                      <p className="font-bold font-mono text-[#4a5568] mb-4">
                        Force update energy data from NREL servers
                      </p>
                      <Button
                        onClick={refreshData}
                        disabled={loading || smartMeterLoading}
                        className="w-full bg-black hover:bg-[#2d3748] text-white font-black font-mono px-6 py-3 text-lg border-4 border-black shadow-[6px_6px_0px_0px_#4a5568] hover:shadow-[8px_8px_0px_0px_#4a5568] transition-all"
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        {loading || smartMeterLoading
                          ? 'REFRESHING...'
                          : 'REFRESH NOW'}
                      </Button>
                    </div>
                  </div>

                  {smartMeterData?.metadata && (
                    <div className="bg-[#f5f5f5] border-4 border-[#4a5568] p-4">
                      <h4 className="text-lg font-black font-mono text-black mb-3">
                        API STATUS & INFORMATION
                      </h4>
                      <div className="space-y-2 font-bold font-mono text-black text-sm">
                        <p>
                          🔑 API Key:{' '}
                          {smartMeterData.metadata.apiKeyStatus || 'Unknown'}
                        </p>
                        <p>
                          📡 Guardian Status:{' '}
                          {smartMeterData.metadata.guardianStatus || 'Unknown'}
                        </p>
                        <p>
                          🌍 Supported Sources:{' '}
                          {smartMeterData.metadata.supportedSources?.join(
                            ', ',
                          ) || 'Solar'}
                        </p>
                        <p>
                          🏢 Locations:{' '}
                          {smartMeterData.metadata.locations?.length || 0}{' '}
                          active monitoring stations
                        </p>
                        <p>
                          ⏱️ Refresh Interval:{' '}
                          {smartMeterData.metadata.refreshInterval
                            ? `${smartMeterData.metadata.refreshInterval / 1000}s`
                            : '30s'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-[#10b981]" />
                  <div>
                    <h2 className="text-2xl font-black font-mono text-black">
                      ENERGY ANALYTICS
                    </h2>
                    <p className="font-bold font-mono text-[#4a5568]">
                      SYSTEM PERFORMANCE & TOKEN METRICS
                    </p>
                  </div>
                </div>

                {stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#4a5568]">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-black font-mono text-black mb-4">
                          ENERGY BALANCE
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between font-bold font-mono text-black mb-2">
                              <span>PRODUCTION</span>
                              <span>
                                {stats.totalProduction.toFixed(1)} kWh
                              </span>
                            </div>
                            <Progress
                              value={Math.min(
                                (stats.totalProduction /
                                  Math.max(
                                    stats.totalProduction +
                                      stats.totalConsumption,
                                    1,
                                  )) *
                                  100,
                                100,
                              )}
                              className="bg-[#f5f5f5] border-2 border-black"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between font-bold font-mono text-black mb-2">
                              <span>CONSUMPTION</span>
                              <span>
                                {stats.totalConsumption.toFixed(1)} kWh
                              </span>
                            </div>
                            <Progress
                              value={Math.min(
                                (stats.totalConsumption /
                                  Math.max(
                                    stats.totalProduction +
                                      stats.totalConsumption,
                                    1,
                                  )) *
                                  100,
                                100,
                              )}
                              className="bg-[#f5f5f5] border-2 border-black"
                            />
                          </div>

                          <div className="pt-4 border-t-2 border-black">
                            <div className="flex justify-between items-center">
                              <span className="font-black font-mono text-black">
                                NET ENERGY
                              </span>
                              <Badge
                                className={`font-black font-mono text-lg px-3 py-1 border-2 border-black ${
                                  stats.totalProduction >=
                                  stats.totalConsumption
                                    ? 'bg-[#10b981] text-white'
                                    : 'bg-red-500 text-white'
                                }`}
                              >
                                {(
                                  stats.totalProduction - stats.totalConsumption
                                ).toFixed(1)}{' '}
                                kWh
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#4a5568]">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-black font-mono text-black mb-4">
                          TOKEN METRICS
                        </h3>
                        <div className="space-y-4">
                          <div className="bg-[#f5f5f5] border-2 border-black p-3">
                            <p className="text-xs font-black font-mono text-[#4a5568]">
                              TOKENS MINTED
                            </p>
                            <p className="text-2xl font-black font-mono text-[#10b981]">
                              {stats.totalTokensMinted}
                            </p>
                          </div>

                          <div className="bg-[#f5f5f5] border-2 border-black p-3">
                            <p className="text-xs font-black font-mono text-[#4a5568]">
                              TOKENS BURNED
                            </p>
                            <p className="text-2xl font-black font-mono text-red-500">
                              {stats.totalTokensBurned}
                            </p>
                          </div>

                          <div className="bg-[#10b981] border-2 border-black p-3">
                            <p className="text-xs font-black font-mono text-white">
                              NET TOKEN BALANCE
                            </p>
                            <p className="text-2xl font-black font-mono text-white">
                              {stats.netTokens}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#4a5568] md:col-span-2">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-black font-mono text-black mb-4">
                          SYSTEM OVERVIEW
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-[#f5f5f5] border-2 border-black p-3 text-center">
                            <Gauge className="h-8 w-8 mx-auto text-[#10b981] mb-2" />
                            <p className="text-lg font-black font-mono text-black">
                              {stats.totalMeters}
                            </p>
                            <p className="text-xs font-black font-mono text-[#4a5568]">
                              ACTIVE METERS
                            </p>
                          </div>

                          <div className="bg-[#f5f5f5] border-2 border-black p-3 text-center">
                            <Activity className="h-8 w-8 mx-auto text-[#10b981] mb-2" />
                            <p className="text-lg font-black font-mono text-black">
                              {stats.totalReadings}
                            </p>
                            <p className="text-xs font-black font-mono text-[#4a5568]">
                              TOTAL READINGS
                            </p>
                          </div>

                          <div className="bg-[#f5f5f5] border-2 border-black p-3 text-center">
                            <TrendingUp className="h-8 w-8 mx-auto text-[#10b981] mb-2" />
                            <p className="text-lg font-black font-mono text-black">
                              {stats.totalReadings > 0
                                ? (
                                    stats.totalProduction / stats.totalReadings
                                  ).toFixed(1)
                                : '0.0'}
                            </p>
                            <p className="text-xs font-black font-mono text-[#4a5568]">
                              AVG PRODUCTION
                            </p>
                          </div>

                          <div className="bg-[#f5f5f5] border-2 border-black p-3 text-center">
                            <Sun className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                            <p className="text-lg font-black font-mono text-black">
                              {getEnergyBySource('solar').toFixed(1)}
                            </p>
                            <p className="text-xs font-black font-mono text-[#4a5568]">
                              SOLAR ENERGY
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-[#f5f5f5] border-4 border-[#4a5568] rounded-lg">
                    <BarChart3 className="h-16 w-16 mx-auto text-[#4a5568] mb-4" />
                    <p className="text-xl font-black font-mono text-black mb-2">
                      NO ANALYTICS DATA AVAILABLE
                    </p>
                    <p className="font-bold font-mono text-[#4a5568]">
                      WAITING FOR SMART METER DATA TO GENERATE ANALYTICS!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
