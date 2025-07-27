import { NextRequest, NextResponse } from 'next/server';
import { getEnergyMeteringService } from '@/lib/energy-metering-service';

// Mock mode check
const MOCK_MODE =
  process.env.HEDERA_MOCK_MODE === 'true' ||
  !process.env.HEDERA_PRIVATE_KEY ||
  !process.env.HEDERA_ACCOUNT_ID;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const accountId = searchParams.get('accountId');
    const meterId = searchParams.get('meterId');

    const meteringService = getEnergyMeteringService();

    switch (action) {
      case 'account-readings':
        if (!accountId) {
          return NextResponse.json(
            { success: false, error: 'Account ID required' },
            { status: 400 },
          );
        }

        const accountReadings = meteringService.getAccountReadings(accountId);
        return NextResponse.json({
          success: true,
          mockMode: MOCK_MODE,
          readings: accountReadings,
          timestamp: new Date().toISOString(),
        });

      case 'meter-readings':
        if (!meterId) {
          return NextResponse.json(
            { success: false, error: 'Meter ID required' },
            { status: 400 },
          );
        }

        const meterReadings = meteringService.getMeterReadings(meterId);
        return NextResponse.json({
          success: true,
          mockMode: MOCK_MODE,
          readings: meterReadings,
          timestamp: new Date().toISOString(),
        });

      case 'mint-records':
        if (!accountId) {
          return NextResponse.json(
            { success: false, error: 'Account ID required' },
            { status: 400 },
          );
        }

        const mintRecords = meteringService.getAccountMintRecords(accountId);
        return NextResponse.json({
          success: true,
          mockMode: MOCK_MODE,
          records: mintRecords,
          timestamp: new Date().toISOString(),
        });

      case 'burn-records':
        if (!accountId) {
          return NextResponse.json(
            { success: false, error: 'Account ID required' },
            { status: 400 },
          );
        }

        const burnRecords = meteringService.getAccountBurnRecords(accountId);
        return NextResponse.json({
          success: true,
          mockMode: MOCK_MODE,
          records: burnRecords,
          timestamp: new Date().toISOString(),
        });

      case 'energy-stats':
        const energyStats = meteringService.getEnergyStats();
        return NextResponse.json({
          success: true,
          mockMode: MOCK_MODE,
          stats: energyStats,
          timestamp: new Date().toISOString(),
        });

      case 'simulate':
        const simulatedReadings = meteringService.simulateEnergyReadings();
        return NextResponse.json({
          success: true,
          mockMode: MOCK_MODE,
          simulatedReadings,
          message: 'Simulated real-time energy readings',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({
          success: true,
          mockMode: MOCK_MODE,
          message: 'Energy metering service available',
          availableActions: [
            'account-readings',
            'meter-readings',
            'mint-records',
            'burn-records',
            'energy-stats',
            'simulate',
          ],
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('Error in energy metering GET endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const meteringService = getEnergyMeteringService();

    switch (action) {
      case 'process-reading':
        if (!params.reading) {
          return NextResponse.json(
            { success: false, error: 'Energy reading data required' },
            { status: 400 },
          );
        }

        const result = await meteringService.processEnergyReading(
          params.reading,
        );

        return NextResponse.json({
          success: true,
          mockMode: MOCK_MODE,
          action: 'process-reading',
          result,
          explorerUrl: result.transactionId
            ? `https://hashscan.io/testnet/transaction/${result.transactionId}`
            : undefined,
          timestamp: new Date().toISOString(),
        });

      case 'batch-process':
        if (!params.readings || !Array.isArray(params.readings)) {
          return NextResponse.json(
            { success: false, error: 'Array of readings required' },
            { status: 400 },
          );
        }

        const batchResults = [];
        for (const reading of params.readings) {
          try {
            const result = await meteringService.processEnergyReading(reading);
            batchResults.push({ reading, result, success: true });
          } catch (error) {
            batchResults.push({
              reading,
              error: error instanceof Error ? error.message : 'Unknown error',
              success: false,
            });
          }
        }

        return NextResponse.json({
          success: true,
          mockMode: MOCK_MODE,
          action: 'batch-process',
          results: batchResults,
          processed: batchResults.filter(r => r.success).length,
          failed: batchResults.filter(r => !r.success).length,
          timestamp: new Date().toISOString(),
        });

      case 'simulate-and-process':
        // Simulate readings and automatically process them
        const simulatedReadings = meteringService.simulateEnergyReadings();
        const processResults = [];

        for (const reading of simulatedReadings) {
          try {
            const result = await meteringService.processEnergyReading(reading);
            processResults.push({ reading, result, success: true });
          } catch (error) {
            processResults.push({
              reading,
              error: error instanceof Error ? error.message : 'Unknown error',
              success: false,
            });
          }
        }

        return NextResponse.json({
          success: true,
          mockMode: MOCK_MODE,
          action: 'simulate-and-process',
          simulatedReadings,
          processResults,
          processed: processResults.filter(r => r.success).length,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action specified',
            availableActions: [
              'process-reading',
              'batch-process',
              'simulate-and-process',
            ],
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Error in energy metering POST endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
