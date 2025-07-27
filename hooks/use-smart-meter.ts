import { useState, useEffect, useCallback } from 'react';

// Enhanced type definitions for NREL energy data
export interface SmartMeterReading {
  userId: string;
  energyAmount: number;
  source: string;
  timestamp: string;
  verified: boolean;
  unit: string;
  location: string;
  // New NREL-specific fields
  nrelData?: {
    solarIrradiance?: number;
    windSpeed?: number;
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: string;
  };
  dataSource: string;
  guardianValidation: 'pending' | 'verified' | 'failed' | 'unverified';
}

export interface SmartMeterResponse {
  success: boolean;
  timestamp: string;
  totalReadings: number;
  data: SmartMeterReading[];
  metadata: {
    refreshInterval: number;
    supportedSources: string[];
    dataFormat: string;
    guardianStatus: string;
    dataSource: string;
    apiKeyStatus: string;
    locations: Array<{ id: string; name: string }>;
  };
}

interface UseSmartMeterOptions {
  userId?: string;
  source?: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
}

export function useSmartMeter(options: UseSmartMeterOptions = {}) {
  const {
    userId,
    source,
    refreshInterval = 30000, // 30 seconds for real NREL data
    autoRefresh = true,
  } = options;

  const [data, setData] = useState<SmartMeterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchSmartMeterData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (source) params.append('source', source);

      const url = `/api/smart-meter${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SmartMeterResponse = await response.json();

      if (result.success) {
        setData(result);
        setLastUpdate(new Date().toISOString());
        setError(null);
      } else {
        throw new Error('API returned error response');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch NREL energy data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, source]);

  // Initial fetch
  useEffect(() => {
    fetchSmartMeterData();
  }, [fetchSmartMeterData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSmartMeterData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchSmartMeterData, refreshInterval, autoRefresh]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setLoading(true);
    fetchSmartMeterData();
  }, [fetchSmartMeterData]);

  // Helper functions
  const getTotalEnergy = useCallback(() => {
    if (!data?.data) return 0;
    return data.data.reduce(
      (total, reading) => total + reading.energyAmount,
      0,
    );
  }, [data]);

  const getEnergyBySource = useCallback(
    (sourceType: string) => {
      if (!data?.data) return 0;
      return data.data
        .filter(
          reading => reading.source.toLowerCase() === sourceType.toLowerCase(),
        )
        .reduce((total, reading) => total + reading.energyAmount, 0);
    },
    [data],
  );

  const getVerifiedReadings = useCallback(() => {
    if (!data?.data) return [];
    return data.data.filter(reading => reading.verified);
  }, [data]);

  const getUnverifiedReadings = useCallback(() => {
    if (!data?.data) return [];
    return data.data.filter(reading => !reading.verified);
  }, [data]);

  // New helper functions for NREL data
  const getGuardianPendingReadings = useCallback(() => {
    if (!data?.data) return [];
    return data.data.filter(reading => reading.guardianValidation === 'pending');
  }, [data]);

  const getGuardianVerifiedReadings = useCallback(() => {
    if (!data?.data) return [];
    return data.data.filter(reading => reading.guardianValidation === 'verified');
  }, [data]);

  const getNRELDataByLocation = useCallback((locationId: string) => {
    if (!data?.data) return [];
    return data.data.filter(reading => 
      reading.location.toLowerCase().includes(locationId.toLowerCase())
    );
  }, [data]);

  const getTotalSolarIrradiance = useCallback(() => {
    if (!data?.data) return 0;
    return data.data
      .filter(reading => reading.nrelData?.solarIrradiance)
      .reduce((total, reading) => total + (reading.nrelData?.solarIrradiance || 0), 0);
  }, [data]);

  const getAverageWindSpeed = useCallback(() => {
    if (!data?.data) return 0;
    const windReadings = data.data.filter(reading => reading.nrelData?.windSpeed);
    if (windReadings.length === 0) return 0;
    
    const totalWindSpeed = windReadings.reduce((total, reading) => 
      total + (reading.nrelData?.windSpeed || 0), 0
    );
    return totalWindSpeed / windReadings.length;
  }, [data]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    // Helper functions
    getTotalEnergy,
    getEnergyBySource,
    getVerifiedReadings,
    getUnverifiedReadings,
    // New NREL-specific helpers
    getGuardianPendingReadings,
    getGuardianVerifiedReadings,
    getNRELDataByLocation,
    getTotalSolarIrradiance,
    getAverageWindSpeed,
    // Computed values
    isConnected: !error && data !== null,
    readingsCount: data?.totalReadings || 0,
    guardianStatus: data?.metadata?.guardianStatus || 'Unknown',
    dataSource: data?.metadata?.dataSource || 'Unknown',
    apiKeyStatus: data?.metadata?.apiKeyStatus || 'Unknown',
    supportedLocations: data?.metadata?.locations || [],
  };
}
