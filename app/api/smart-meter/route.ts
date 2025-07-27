import { NextRequest, NextResponse } from 'next/server';

// NREL API configuration
const NREL_API_KEY = process.env.NREL_API_KEY || 'DEMO_KEY';
const NREL_BASE_URL = 'https://developer.nrel.gov/api';

// Real locations for energy data
const ENERGY_LOCATIONS = [
  {
    id: 'golden_co',
    name: 'NREL Solar Radiation Research Laboratory',
    lat: 39.7392,
    lng: -105.2091,
    elevation: 1828,
    timezone: 'America/Denver'
  },
  {
    id: 'boulder_co',
    name: 'Boulder Atmospheric Observatory',
    lat: 40.0150,
    lng: -105.2705,
    elevation: 1683,
    timezone: 'America/Denver'
  },
  {
    id: 'san_diego_ca',
    name: 'San Diego Solar Station',
    lat: 32.7157,
    lng: -117.1611,
    elevation: 430,
    timezone: 'America/Los_Angeles'
  },
  {
    id: 'austin_tx',
    name: 'Austin Energy Solar Farm',
    lat: 30.2672,
    lng: -97.7431,
    elevation: 165,
    timezone: 'America/Chicago'
  },
  {
    id: 'phoenix_az',
    name: 'Phoenix Solar Research Center',
    lat: 33.4484,
    lng: -112.0740,
    elevation: 331,
    timezone: 'America/Phoenix'
  }
];

// Fetch real solar resource data from NREL
async function fetchNRELSolarResource(location: { lat: number; lng: number; }) {
  const url = `${NREL_BASE_URL}/solar/solar_resource/v1.json?api_key=${NREL_API_KEY}&lat=${location.lat}&lon=${location.lng}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`NREL Solar API error: ${response.status} - ${response.statusText}`);
    return null;
  }
  const data = await response.json();
  if (!data.outputs) {
    console.error('No outputs in solar API response');
    return null;
  }
  return data.outputs;
}

// Generate solar data for all locations
async function generateSolarData() {
  const solarData = [];
  for (let i = 0; i < ENERGY_LOCATIONS.length; i++) {
    const location = ENERGY_LOCATIONS[i];
    const userId = `user_${String(i + 1).padStart(3, '0')}`;
    try {
      const outputs = await fetchNRELSolarResource(location);
      if (outputs) {
        // Calculate energyAmount from avg_ghi (annual, kWh/m^2/day)
        // Assume 60 m^2 panel, 15% efficiency, 1 day
        const avgGHI = outputs.avg_ghi?.annual || 0;
        const panelArea = 60; // m^2
        const efficiency = 0.15;
        // Daily energy in kWh: avgGHI * area * efficiency
        const energyAmount = Math.round(avgGHI * panelArea * efficiency * 100) / 100;
        solarData.push({
          userId,
          location: location.name,
          lat: location.lat,
          lng: location.lng,
          elevation: location.elevation,
          timezone: location.timezone,
          timestamp: new Date().toISOString(),
          dataSource: 'NREL Solar Resource API v1',
          avg_dni: outputs.avg_dni || null,
          avg_ghi: outputs.avg_ghi || null,
          avg_lat_tilt: outputs.avg_lat_tilt || null,
          guardianValidation: 'pending',
          energyAmount,
          unit: 'kWh',
          source: 'solar',
          verified: !!outputs.avg_ghi
        });
      } else {
        solarData.push({
          userId,
          location: location.name,
          lat: location.lat,
          lng: location.lng,
          elevation: location.elevation,
          timezone: location.timezone,
          timestamp: new Date().toISOString(),
          dataSource: 'NREL Solar Resource API v1',
          avg_dni: null,
          avg_ghi: null,
          avg_lat_tilt: null,
          guardianValidation: 'failed',
          energyAmount: 0,
          unit: 'kWh',
          source: 'solar',
          verified: false
        });
      }
    } catch (error) {
      console.error(`Error processing location ${location.name}:`, error);
      solarData.push({
        userId,
        location: location.name,
        lat: location.lat,
        lng: location.lng,
        elevation: location.elevation,
        timezone: location.timezone,
        timestamp: new Date().toISOString(),
        dataSource: 'NREL Solar Resource API v1',
        avg_dni: null,
        avg_ghi: null,
        avg_lat_tilt: null,
        guardianValidation: 'failed',
        energyAmount: 0,
        unit: 'kWh',
        source: 'solar',
        verified: false
      });
    }
  }
  return solarData;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    // Only solar data is supported
    const solarData = await generateSolarData();
    let filteredData = solarData;
    if (userId) {
      filteredData = solarData.filter(data => data.userId === userId);
    }
    const responseData = {
      success: true,
      timestamp: new Date().toISOString(),
      totalReadings: filteredData.length,
      data: filteredData,
      metadata: {
        refreshInterval: 30000,
        supportedSources: ['solar'],
        dataFormat: 'NREL Solar Resource API v1 (avg_dni, avg_ghi, avg_lat_tilt)',
        guardianStatus: 'Ready for Guardian validation',
        apiEndpoints: {
          solar: `${NREL_BASE_URL}/solar/solar_resource/v1.json`
        },
        apiKeyStatus: NREL_API_KEY === 'DEMO_KEY' ? 'Using demo key - limited to 1000 requests/hour' : 'Using production key',
        locations: ENERGY_LOCATIONS.map(loc => ({
          id: loc.id,
          name: loc.name,
          coordinates: `${loc.lat}, ${loc.lng}`
        })),
        dataSource: 'National Renewable Energy Laboratory (NREL)',
        notes: [
          'Solar data from NREL Solar Resource API v1',
          'avg_dni, avg_ghi, avg_lat_tilt returned as kWh/m²/day (annual and monthly)',
          'No wind data included'
        ]
      },
    };
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
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
        error: 'Failed to fetch real solar data from NREL',
        details: error instanceof Error ? error.message : 'Unknown error',
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const responseData = {
      success: true,
      message: 'Solar data received for Guardian validation',
      receivedData: body,
      timestamp: new Date().toISOString(),
      verified: false,
      guardianStatus: 'Pending Guardian validation',
      nrelValidation: 'Data source: NREL Solar Resource API v1',
      nextSteps: [
        'Send to Hedera Guardian for verification',
        'Validate against NREL historical data',
        'Check geographic consistency',
        'Verify timestamp accuracy',
        'Mint tokens if validation passes'
      ]
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
        error: 'Failed to process solar data for Guardian validation',
        details: error instanceof Error ? error.message : 'Unknown error',
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
