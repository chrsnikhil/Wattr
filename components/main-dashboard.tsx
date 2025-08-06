'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserRole } from '@/hooks/use-user-role';
import { UserRoleManager } from '@/lib/user-roles';
import EnergyMeteringDashboard from '@/components/energy-metering-dashboard';
import EnergyTradingDashboard from '@/components/energy-trading-dashboard';
import EnergyMarketplace from '@/components/energy-marketplace';
import ProsumerDashboard from '@/components/prosumer-dashboard';
import RoleSelection from '@/components/role-selection';
import {
  Activity,
  ShoppingCart,
  Settings,
  User,
  Shield,
  Crown,
  Eye,
  Zap,
  LogOut,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export default function MainDashboard() {
  const {
    userProfile,
    isAuthenticated,
    isLoading,
    error,
    hasPermission,
    registerUser,
    updateRole,
    clearRole,
    refreshProfile,
  } = useUserRole();

  const [activeTab, setActiveTab] = useState('metering');
  const [showRoleSettings, setShowRoleSettings] = useState(false);

  // Helper functions
  const userRole = userProfile?.role;
  const canAccessMarketplace = hasPermission('access', 'marketplace');
  const canCreateListings = hasPermission('create', 'listings');
  const canTrade = hasPermission('trade', 'energy');

  // Show role selection if no role is set
  if (!userProfile && !isLoading) {
    return (
      <RoleSelection
        onRoleSelected={async (role, displayName) => {
          await registerUser(role, displayName);
        }}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] p-8">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-[#10b981]"></div>
            <span className="text-xl font-black font-mono text-black">
              LOADING DASHBOARD...
            </span>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
        <Card className="bg-white border-4 border-red-500 shadow-[8px_8px_0px_0px_#4a5568] max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-black font-mono text-black mb-2">
              ERROR LOADING DASHBOARD
            </h2>
            <p className="text-sm font-bold font-mono text-red-600 mb-4">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white font-black font-mono"
            >
              RETRY
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleIcon = () => {
    return userRole === 'prosumer' ? (
      <Crown className="h-5 w-5 text-[#10b981]" />
    ) : (
      <Eye className="h-5 w-5 text-blue-500" />
    );
  };

  const getRoleBadgeColor = () => {
    return userRole === 'prosumer' ? 'bg-[#10b981]' : 'bg-blue-500';
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a5568_1px,transparent_1px),linear-gradient(90deg,#4a5568_1px,transparent_1px)] bg-[size:20px_20px]">
      {/* Header */}
      <div className="bg-white border-b-4 border-black shadow-[0px_8px_0px_0px_#4a5568] p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black font-mono text-black tracking-wider">
                WATTR DASHBOARD
              </h1>
              <p className="text-sm font-bold font-mono text-[#4a5568]">
                Energy Trading & Monitoring Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {getRoleIcon()}
                  <span className="text-sm font-black font-mono text-black">
                    {userProfile?.displayName || 'UNNAMED USER'}
                  </span>
                </div>
                <Badge
                  className={`${getRoleBadgeColor()} text-white border-2 border-black font-black font-mono text-xs`}
                >
                  {userRole?.toUpperCase()}
                </Badge>
              </div>
              <User className="h-8 w-8 text-[#4a5568]" />
            </div>

            {/* Settings */}
            <Button
              onClick={() => setShowRoleSettings(!showRoleSettings)}
              variant="outline"
              className="border-4 border-black bg-white hover:bg-[#f5f5f5] font-black font-mono shadow-[4px_4px_0px_0px_#4a5568]"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Role Settings Panel */}
        {showRoleSettings && (
          <div className="mt-6 pt-6 border-t-4 border-[#4a5568]">
            <Card className="bg-[#f5f5f5] border-4 border-black shadow-[4px_4px_0px_0px_#4a5568]">
              <CardHeader>
                <CardTitle className="text-lg font-black font-mono text-black flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  ROLE SETTINGS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-black font-mono text-black mb-2">
                      CURRENT ROLE:
                    </h4>
                    <div className="flex items-center gap-2">
                      {getRoleIcon()}
                      <span className="font-bold font-mono text-black">
                        {UserRoleManager.getRoleInfo(userRole!).name}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-black font-mono text-black mb-2">
                      PERMISSIONS:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        className={`${
                          canAccessMarketplace ? 'bg-[#10b981]' : 'bg-[#4a5568]'
                        } text-white border border-black font-black font-mono text-xs`}
                      >
                        {canAccessMarketplace ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        MARKETPLACE
                      </Badge>
                      <Badge
                        className={`${
                          canCreateListings ? 'bg-[#10b981]' : 'bg-[#4a5568]'
                        } text-white border border-black font-black font-mono text-xs`}
                      >
                        {canCreateListings ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        LISTINGS
                      </Badge>
                      <Badge
                        className={`${
                          canTrade ? 'bg-[#10b981]' : 'bg-[#4a5568]'
                        } text-white border border-black font-black font-mono text-xs`}
                      >
                        {canTrade ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        TRADING
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      // Clear user role to show role selection again
                      clearRole();
                      setShowRoleSettings(false);
                    }}
                    variant="outline"
                    className="border-4 border-red-500 bg-white hover:bg-red-50 text-red-600 font-black font-mono shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    CHANGE ROLE
                  </Button>
                  <Button
                    onClick={() => setShowRoleSettings(false)}
                    className="bg-black hover:bg-[#2d3748] text-white font-black font-mono border-4 border-black shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                  >
                    CLOSE
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] p-2 mb-6">
            <TabsTrigger
              value="metering"
              className="font-black font-mono data-[state=active]:bg-[#10b981] data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black"
            >
              <Activity className="h-4 w-4 mr-2" />
              {userRole === 'prosumer' ? 'PROSUMER HUB' : 'ENERGY METERING'}
            </TabsTrigger>

            <TabsTrigger
              value="trading"
              className={`font-black font-mono data-[state=active]:bg-[#10b981] data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-black ${
                !canAccessMarketplace ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!canAccessMarketplace}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              ENERGY TRADING
              {!canAccessMarketplace && (
                <Shield className="h-3 w-3 ml-2 text-red-500" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Permission Warning */}
          {userRole === 'viewer' && activeTab === 'trading' && (
            <Alert className="mb-6 bg-blue-100 border-4 border-blue-500 shadow-[8px_8px_0px_0px_#4a5568]">
              <Eye className="h-6 w-6 text-blue-500" />
              <AlertDescription className="font-black font-mono text-blue-800 text-lg">
                YOU'RE VIEWING AS A DEMO USER. TRADING FEATURES ARE READ-ONLY.
                <Button
                  onClick={() => setShowRoleSettings(true)}
                  variant="link"
                  className="ml-2 text-blue-600 underline font-black font-mono"
                >
                  UPGRADE TO PROSUMER →
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <TabsContent value="metering" className="space-y-6">
            {userRole === 'prosumer' ? (
              <ProsumerDashboard />
            ) : (
              <EnergyMeteringDashboard />
            )}
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            {canAccessMarketplace ? (
              <EnergyMarketplace />
            ) : (
              <Card className="bg-white border-4 border-red-500 shadow-[8px_8px_0px_0px_#4a5568]">
                <CardContent className="p-8 text-center">
                  <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-black font-mono text-black mb-4">
                    ACCESS RESTRICTED
                  </h2>
                  <p className="text-lg font-bold font-mono text-[#4a5568] mb-6">
                    Energy marketplace requires prosumer role access.
                  </p>
                  <Button
                    onClick={() => setShowRoleSettings(true)}
                    className="bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono border-4 border-black shadow-[4px_4px_0px_0px_#4a5568]"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    UPGRADE TO PROSUMER
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
