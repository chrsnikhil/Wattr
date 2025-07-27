'use client';

import { useSmartMeter } from '@/hooks/use-smart-meter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Zap, Shield, Clock, MapPin, Database, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function SmartMeterDemo() {
  const [selectedUser, setSelectedUser] = useState<string>('');

  const {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    getTotalEnergy,
    getEnergyBySource,
    getVerifiedReadings,
    getGuardianPendingReadings,
    getTotalSolarIrradiance,
    isConnected,
    readingsCount,
    guardianStatus,
    dataSource,
    apiKeyStatus,
    supportedLocations,
  } = useSmartMeter({
    source: 'solar',
    userId: selectedUser || undefined,
    autoRefresh: true,
    refreshInterval: 30000, // 30-second updates for real NREL data
  });

  const availableUsers = data?.data?.map(reading => reading.userId) || [];
  const uniqueUsers = [...new Set(availableUsers)];

  if (loading && !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-[#10b981]" />
            <span className="text-lg font-bold font-mono text-black">
              LOADING NREL SOLAR DATA...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-black">
              NREL API CONNECTION ERROR
            </CardTitle>
            <CardDescription className="font-medium text-black">
              Failed to connect to NREL solar data: {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={refresh}
              className="mt-4 bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              RETRY NREL CONNECTION
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-6xl font-black font-mono text-black tracking-wider mb-4">
            NREL SOLAR ENERGY NETWORK
          </h1>
          <p className="text-xl font-bold font-mono text-black">
            REAL-TIME SOLAR ENERGY DATA FROM NATIONAL RENEWABLE ENERGY LABORATORY
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge
            className={`${isConnected ? 'bg-[#10b981]' : 'bg-black'} text-white font-bold font-mono px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_#4a5568]`}
          >
            <Database className="h-4 w-4 mr-2" />
            {isConnected ? 'NREL CONNECTED' : 'DISCONNECTED'}
          </Badge>
          <Button
            onClick={refresh}
            disabled={loading}
            className="bg-black hover:bg-[#2d3748] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
          >
            <RefreshCw
              className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            REFRESH
          </Button>
        </div>
      </div>

      {/* NREL Data Source Info */}
      <Card className="bg-blue-50 border-4 border-blue-500 shadow-[8px_8px_0px_0px_#4a5568]">
        <CardHeader>
          <CardTitle className="text-xl font-black font-mono text-blue-800 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            NREL DATA SOURCE INFORMATION
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="font-bold text-blue-800">Data Source: {dataSource}</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="font-bold text-orange-800">API Status: {apiKeyStatus}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="font-bold text-green-800">{supportedLocations.length} Research Locations</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
        <CardHeader>
          <CardTitle className="text-2xl font-black font-mono text-black">
            FILTERS
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-black font-mono text-black">
              RESEARCH LOCATION:
            </span>
            <Button
              variant={selectedUser === '' ? 'default' : 'outline'}
              onClick={() => setSelectedUser('')}
              className={`${
                selectedUser === ''
                  ? 'bg-[#10b981] text-white border-4 border-black shadow-[4px_4px_0px_0px_#4a5568]'
                  : 'bg-white border-4 border-black text-black shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568]'
              } font-black font-mono px-4 py-2 transition-all`}
            >
              ALL LOCATIONS
            </Button>
            {uniqueUsers.slice(0, 5).map(userId => (
              <Button
                key={userId}
                variant={selectedUser === userId ? 'default' : 'outline'}
                onClick={() => setSelectedUser(userId)}
                className={`${
                  selectedUser === userId
                    ? 'bg-[#10b981] text-white border-4 border-black shadow-[4px_4px_0px_0px_#4a5568]'
                    : 'bg-white border-4 border-black text-black shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568]'
                } font-black font-mono px-4 py-2 transition-all`}
              >
                {userId}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-black font-mono text-black">
                  TOTAL SOLAR ENERGY
                </p>
                <p className="text-3xl font-black font-mono text-black">
                  {getTotalEnergy().toFixed(1)}
                </p>
                <p className="text-sm font-black font-mono text-[#10b981]">
                  kWh
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-yellow-500 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-black font-mono text-black">
                  SOLAR IRRADIANCE
                </p>
                <p className="text-3xl font-black font-mono text-black">
                  {getTotalSolarIrradiance().toFixed(0)}
                </p>
                <p className="text-sm font-black font-mono text-[#10b981]">
                  W/m²
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-black font-mono text-black">
                  GUARDIAN READY
                </p>
                <p className="text-3xl font-black font-mono text-black">
                  {getGuardianPendingReadings().length}/{readingsCount}
                </p>
                <p className="text-sm font-black font-mono text-[#10b981]">
                  READINGS
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Data Table */}
      <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-black font-mono text-black">
            <div className="w-8 h-8 bg-[#10b981] border-2 border-black flex items-center justify-center mr-4">
              <Database className="h-5 w-5 text-white" />
            </div>
            LIVE NREL SOLAR READINGS
          </CardTitle>
          <CardDescription className="font-bold font-mono text-black">
            REAL-TIME SOLAR ENERGY PRODUCTION DATA FROM NREL RESEARCH FACILITIES
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black">
              <thead className="bg-black text-white">
                <tr>
                  <th className="text-left py-4 px-4 font-black font-mono border-2 border-white">
                    LOCATION
                  </th>
                  <th className="text-left py-4 px-4 font-black font-mono border-2 border-white">
                    ENERGY AMOUNT
                  </th>
                  <th className="text-left py-4 px-4 font-black font-mono border-2 border-white">
                    DATA SOURCE
                  </th>
                  <th className="text-left py-4 px-4 font-black font-mono border-2 border-white">
                    GUARDIAN STATUS
                  </th>
                  <th className="text-left py-4 px-4 font-black font-mono border-2 border-white">
                    TIMESTAMP
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data?.data?.map((reading, index) => (
                  <tr
                    key={`${reading.userId}-solar-${index}`}
                    className="border-2 border-black hover:bg-gray-100 transition-colors"
                  >
                    <td className="py-4 px-4 font-black font-mono text-sm border-2 border-black">
                      {reading.location}
                    </td>
                    <td className="py-4 px-4 font-black font-mono text-[#10b981] border-2 border-black">
                      {reading.energyAmount.toFixed(1)} {reading.unit}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-black border-2 border-black">
                      {reading.dataSource}
                    </td>
                    <td className="py-4 px-4 border-2 border-black">
                      <Badge
                        className={`${
                          reading.guardianValidation === 'verified'
                            ? 'bg-[#10b981] text-white'
                            : reading.guardianValidation === 'pending'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                        } font-bold font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568] uppercase`}
                      >
                        {reading.guardianValidation}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm font-black font-mono text-black border-2 border-black">
                      {new Date(reading.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.data?.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xl font-black font-mono text-black">
                NO NREL SOLAR READINGS FOUND FOR THE SELECTED FILTERS.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guardian Integration Status */}
      <Card className="bg-black border-4 border-[#10b981] shadow-[12px_12px_0px_0px_#4a5568]">
        <CardHeader>
          <CardTitle className="text-2xl font-black font-mono text-white">
            HEDERA GUARDIAN INTEGRATION STATUS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black font-mono text-white">
                NREL DATA VALIDATION
              </p>
              <p className="text-xl font-black font-mono text-[#10b981]">
                {guardianStatus}
              </p>
              <p className="text-sm font-mono text-gray-300 mt-2">
                Ready for Guardian verification of NREL solar energy data
              </p>
            </div>
            <Badge className="bg-[#10b981] text-white font-black font-mono px-4 py-2 border-2 border-white shadow-[4px_4px_0px_0px_white]">
              <Shield className="h-4 w-4 mr-2" />
              READY FOR VALIDATION
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
