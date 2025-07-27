import { NextRequest, NextResponse } from 'next/server';

// Mock smart meter data for different users and energy sources
const mockSmartMeterData = [
  {
    userId: 'user_001',
    energyAmount: 12.5,
    source: 'solar',
    timestamp: new Date().toISOString(),
    verified: true,
    unit: 'kWh',
    location: 'Residential Solar Panel',
  },
  {
    userId: 'user_002',
    energyAmount: 8.3,
    source: 'wind',
    timestamp: new Date().toISOString(),
    verified: true,
    unit: 'kWh',
    location: 'Community Wind Turbine',
  },
  {
    userId: 'user_003',
    energyAmount: 15.7,
    source: 'solar',
    timestamp: new Date().toISOString(),
    verified: true,
    unit: 'kWh',
    location: 'Commercial Solar Array',
  },
  {
    userId: 'user_004',
    energyAmount: 6.2,
    source: 'hydro',
    timestamp: new Date().toISOString(),
    verified: true,
    unit: 'kWh',
    location: 'Micro Hydro Generator',
  },
  {
    userId: 'user_005',
    energyAmount: 22.1,
    source: 'solar',
    timestamp: new Date().toISOString(),
    verified: true,
    unit: 'kWh',
    location: 'Industrial Solar Farm',
  },
];

// Function to simulate real-time energy fluctuations
function generateRealtimeData() {
  return mockSmartMeterData.map(data => {
    // Add random variation to energy amount (±20%)
    const variation = (Math.random() - 0.5) * 0.4;
    const newEnergyAmount = Math.max(0, data.energyAmount * (1 + variation));

    return {
      ...data,
      energyAmount: Math.round(newEnergyAmount * 10) / 10, // Round to 1 decimal place
      timestamp: new Date().toISOString(),
      // Occasionally simulate verification delays
      verified: Math.random() > 0.05, // 95% chance of being verified
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const source = searchParams.get('source');

    // Generate real-time data
    const realtimeData = generateRealtimeData();

    // Filter by userId if provided
    let filteredData = realtimeData;
    if (userId) {
      filteredData = realtimeData.filter(data => data.userId === userId);
    }

    // Filter by energy source if provided
    if (source) {
      filteredData = filteredData.filter(
        data => data.source.toLowerCase() === source.toLowerCase(),
      );
    }

    // If no specific user requested, return all data
    const responseData = {
      success: true,
      timestamp: new Date().toISOString(),
      totalReadings: filteredData.length,
      data: filteredData,
      metadata: {
        refreshInterval: 5000, // Suggest 5-second refresh interval
        supportedSources: ['solar', 'wind', 'hydro'],
        dataFormat: 'Real-time energy production data',
        guardianStatus: 'mock verification for now, remove this later',
      },
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Enable CORS for frontend requests
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Suggest client refresh every 5 seconds for real-time feel
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Smart meter API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch smart meter data',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}

// Handle POST requests for testing purposes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Echo back the received data with timestamp and verification
    const responseData = {
      success: true,
      message: 'Smart meter data received',
      receivedData: body,
      timestamp: new Date().toISOString(),
      verified: true,
      guardianStatus: 'Mock verification successful',
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Smart meter POST error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process smart meter data',
        timestamp: new Date().toISOString(),
      },
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
