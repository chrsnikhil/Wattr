'use client';

import React, { useState } from 'react';
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
import { UserRole, UserRoleManager } from '@/lib/user-roles';
import {
  Zap,
  Eye,
  CheckCircle,
  AlertTriangle,
  User,
  ShoppingCart,
  BarChart3,
  Activity,
} from 'lucide-react';

interface RoleSelectionProps {
  onRoleSelected: (role: UserRole, displayName?: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export default function RoleSelection({
  onRoleSelected,
  isLoading = false,
  error = null,
}: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    try {
      await onRoleSelected(selectedRole, displayName || undefined);
    } catch (err) {
      console.error('Error selecting role:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    return role === 'prosumer' ? (
      <Zap className="h-12 w-12 text-[#10b981]" />
    ) : (
      <Eye className="h-12 w-12 text-blue-500" />
    );
  };

  const getRoleColor = (role: UserRole) => {
    return role === 'prosumer' ? 'bg-[#10b981]' : 'bg-blue-500';
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a5568_1px,transparent_1px),linear-gradient(90deg,#4a5568_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_#4a5568] mx-auto mb-6">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black font-mono text-black tracking-wider mb-4">
            CHOOSE YOUR ROLE
          </h1>
          <p className="text-lg font-bold font-mono text-black">
            SELECT HOW YOU WANT TO PARTICIPATE IN THE ENERGY MARKETPLACE
          </p>
        </div>

        {error && (
          <Alert className="bg-red-100 border-4 border-red-500 shadow-[8px_8px_0px_0px_#4a5568]">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <AlertDescription className="font-black font-mono text-red-800 text-lg">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(['prosumer', 'viewer'] as UserRole[]).map(role => {
            const roleInfo = UserRoleManager.getRoleInfo(role);
            const isSelected = selectedRole === role;

            return (
              <Card
                key={role}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? `bg-white border-4 border-[#10b981] shadow-[12px_12px_0px_0px_#4a5568] transform -translate-y-1`
                    : 'bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] hover:transform hover:-translate-y-1'
                }`}
                onClick={() => setSelectedRole(role)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getRoleIcon(role)}
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <CardTitle className="text-2xl font-black font-mono text-black">
                      {roleInfo.name.toUpperCase()}
                    </CardTitle>
                    {isSelected && (
                      <CheckCircle className="h-6 w-6 text-[#10b981]" />
                    )}
                  </div>
                  <CardDescription className="text-base font-bold font-mono text-black">
                    {roleInfo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-lg font-black font-mono text-black">
                      CAPABILITIES:
                    </h4>
                    {roleInfo.capabilities.map((capability, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#10b981] flex-shrink-0" />
                        <span className="font-bold font-mono text-black text-sm">
                          {capability}
                        </span>
                      </div>
                    ))}
                  </div>

                  {role === 'prosumer' && (
                    <div className="bg-[#f5f5f5] border-2 border-black p-4 space-y-2">
                      <h5 className="font-black font-mono text-black text-sm">
                        PROSUMER FEATURES:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-[#10b981] text-white border-2 border-black font-black font-mono">
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          TRADING
                        </Badge>
                        <Badge className="bg-[#10b981] text-white border-2 border-black font-black font-mono">
                          <Zap className="h-3 w-3 mr-1" />
                          SELLING
                        </Badge>
                        <Badge className="bg-[#10b981] text-white border-2 border-black font-black font-mono">
                          <Activity className="h-3 w-3 mr-1" />
                          METERING
                        </Badge>
                      </div>
                    </div>
                  )}

                  {role === 'viewer' && (
                    <div className="bg-[#f5f5f5] border-2 border-black p-4 space-y-2">
                      <h5 className="font-black font-mono text-black text-sm">
                        VIEWER FEATURES:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-500 text-white border-2 border-black font-black font-mono">
                          <Eye className="h-3 w-3 mr-1" />
                          VIEWING
                        </Badge>
                        <Badge className="bg-blue-500 text-white border-2 border-black font-black font-mono">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          ANALYTICS
                        </Badge>
                        <Badge className="bg-blue-500 text-white border-2 border-black font-black font-mono">
                          <Activity className="h-3 w-3 mr-1" />
                          MONITORING
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Display Name Input */}
        {selectedRole && (
          <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
            <CardContent className="p-6">
              <h3 className="text-xl font-black font-mono text-black mb-4">
                OPTIONAL: SET DISPLAY NAME
              </h3>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder={`Enter your ${selectedRole} display name...`}
                className="w-full bg-white border-4 border-[#10b981] text-black placeholder:text-[#4a5568] font-bold font-mono p-3 shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                maxLength={50}
              />
              <p className="text-sm font-bold font-mono text-[#4a5568] mt-2">
                This will be displayed in the marketplace instead of your wallet
                address
              </p>
            </CardContent>
          </Card>
        )}

        {/* Confirm Button */}
        {selectedRole && (
          <div className="text-center">
            <Button
              onClick={handleRoleSelect}
              disabled={isLoading || isSubmitting}
              className="bg-black hover:bg-[#2d3748] text-white font-black font-mono px-12 py-4 text-xl border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  SETTING UP...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6 mr-3" />
                  CONFIRM AS {selectedRole.toUpperCase()}
                </>
              )}
            </Button>

            <p className="text-sm font-bold font-mono text-[#4a5568] mt-4">
              You can change your role later in the settings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
