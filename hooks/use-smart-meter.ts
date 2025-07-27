import { useState, useEffect, useCallback } from 'react';

// Type definitions for smart meter data
export interface SmartMeterReading {
  userId: string;
  energyAmount: number;
  source: string;
  timestamp: string;
  verified: boolean;
  unit: string;
  location: string;
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
    refreshInterval = 5000,
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
      console.error('Failed to fetch smart meter data:', err);
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
    // Computed values
    isConnected: !error && data !== null,
    readingsCount: data?.totalReadings || 0,
    guardianStatus: data?.metadata?.guardianStatus || 'Unknown',
  };
}
