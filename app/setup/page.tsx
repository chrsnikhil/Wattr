'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useWallets } from '@privy-io/react-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Shield,
  Leaf,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  Home,
  User,
} from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  loading: boolean;
}

export default function FirstTimeSetup() {
  const { user } = useUser();
  const { wallets } = useWallets();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState({
    name: '',
    location: '',
    isProducer: false,
    isConsumer: true,
  });
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'wallet-connection',
      title: 'WALLET CONNECTED',
      description: 'Connect your wallet to continue',
      completed: false,
      loading: false,
    },
    {
      id: 'hedera-account',
      title: 'HEDERA ACCOUNT CREATION',
      description: 'Create your blockchain account',
      completed: false,
      loading: false,
    },
    {
      id: 'token-association',
      title: 'TOKEN ASSOCIATION',
      description: 'Associate with WEC energy tokens',
      completed: false,
      loading: false,
    },
    {
      id: 'profile-setup',
      title: 'PROFILE SETUP',
      description: 'Complete your energy trader profile',
      completed: false,
      loading: false,
    },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check wallet connection
    if (wallets && wallets.length > 0) {
      updateStepStatus('wallet-connection', true, false);
      if (currentStep === 0) {
        setCurrentStep(1);
      }
    }
  }, [wallets, currentStep]);

  const updateStepStatus = (
    stepId: string,
    completed: boolean,
    loading: boolean,
  ) => {
    setSetupSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, completed, loading } : step,
      ),
    );
  };

  const createHederaAccount = async () => {
    if (!wallets || wallets.length === 0) {
      setError('No wallet connected');
      return;
    }

    try {
      setError(null);
      updateStepStatus('hedera-account', false, true);

      const walletAddress = wallets[0].address;

      // Check if already mapped
      const checkResponse = await fetch(
        '/api/wallet-tokens?' +
          new URLSearchParams({
            action: 'check-mapping',
            walletAddress,
          }),
      );

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.accountId) {
          // Already mapped, proceed to next step
          updateStepStatus('hedera-account', true, false);
          setCurrentStep(2);
          return;
        }
      }

      // Create new account
      const response = await fetch('/api/wallet-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-account',
          walletAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Hedera account');
      }

      const data = await response.json();

      if (data.success) {
        updateStepStatus('hedera-account', true, false);
        setCurrentStep(2);
      } else {
        throw new Error(data.error || 'Account creation failed');
      }
    } catch (error) {
      console.error('Error creating Hedera account:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create account',
      );
      updateStepStatus('hedera-account', false, false);
    }
  };

  const associateToken = async () => {
    if (!wallets || wallets.length === 0) return;

    try {
      setError(null);
      updateStepStatus('token-association', false, true);

      const walletAddress = wallets[0].address;

      const response = await fetch('/api/wallet-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'associate-token',
          walletAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to associate token');
      }

      const data = await response.json();

      if (data.success) {
        updateStepStatus('token-association', true, false);
        setCurrentStep(3);
      } else {
        throw new Error(data.error || 'Token association failed');
      }
    } catch (error) {
      console.error('Error associating token:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to associate token',
      );
      updateStepStatus('token-association', false, false);
    }
  };

  const completeProfileSetup = async () => {
    if (!wallets || wallets.length === 0) return;

    if (!userProfile.name.trim() || !userProfile.location.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      updateStepStatus('profile-setup', false, true);

      const walletAddress = wallets[0].address;

      // Get account ID first
      const checkResponse = await fetch(
        '/api/wallet-tokens?' +
          new URLSearchParams({
            action: 'check-mapping',
            walletAddress,
          }),
      );

      if (!checkResponse.ok) {
        throw new Error('Failed to get account information');
      }

      const accountData = await checkResponse.json();
      if (!accountData.accountId) {
        throw new Error('No Hedera account found');
      }

      // Register user profile
      const response = await fetch('/api/energy-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register-user',
          accountId: accountData.accountId,
          name: userProfile.name,
          location: userProfile.location,
          isProducer: userProfile.isProducer,
          isConsumer: userProfile.isConsumer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register user profile');
      }

      const data = await response.json();

      if (data.success) {
        updateStepStatus('profile-setup', true, false);
        // Redirect to dashboard after successful setup
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        throw new Error(data.error || 'Profile setup failed');
      }
    } catch (error) {
      console.error('Error setting up profile:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to setup profile',
      );
      updateStepStatus('profile-setup', false, false);
    }
  };

  const getStepAction = (stepIndex: number) => {
    switch (stepIndex) {
      case 1:
        return createHederaAccount;
      case 2:
        return associateToken;
      case 3:
        return completeProfileSetup;
      default:
        return () => {};
    }
  };

  const isStepCompleted = setupSteps.every(step => step.completed);

  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a5568_1px,transparent_1px),linear-gradient(90deg,#4a5568_1px,transparent_1px)] bg-[size:20px_20px] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-black font-mono tracking-wider mb-4">
            WELCOME TO WATTR
          </h1>
          <p className="text-xl text-black font-mono font-bold mb-2">
            FIRST-TIME SETUP
          </p>
          <p className="text-base font-medium text-black">
            Let's get your energy trading account ready in just a few steps
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-4 border-red-500 shadow-[8px_8px_0px_0px_#dc2626] mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <p className="font-bold font-mono text-red-700">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Steps Progress */}
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568] mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-black">
              SETUP PROGRESS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {setupSteps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-4 p-4 border-2 border-black rounded bg-white"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-black ${
                    step.completed
                      ? 'bg-[#10b981] text-white'
                      : step.loading
                        ? 'bg-yellow-400 text-black'
                        : index === currentStep
                          ? 'bg-black text-white'
                          : 'bg-white text-black'
                  }`}
                >
                  {step.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="font-black font-mono text-sm">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-black font-mono text-black">
                    {step.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-600">
                    {step.description}
                  </p>
                </div>
                {step.completed && (
                  <Badge className="bg-[#10b981] text-white font-bold font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    COMPLETE
                  </Badge>
                )}
                {step.loading && (
                  <Badge className="bg-yellow-400 text-black font-bold font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                    <Clock className="mr-1 h-3 w-3" />
                    PROCESSING
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Current Step Content */}
        {!isStepCompleted && (
          <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568] mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-black font-mono text-black flex items-center gap-3">
                {currentStep === 0 && (
                  <Zap className="h-8 w-8 text-[#10b981]" />
                )}
                {currentStep === 1 && (
                  <Shield className="h-8 w-8 text-[#10b981]" />
                )}
                {currentStep === 2 && (
                  <Leaf className="h-8 w-8 text-[#10b981]" />
                )}
                {currentStep === 3 && (
                  <User className="h-8 w-8 text-[#10b981]" />
                )}
                {setupSteps[currentStep]?.title || 'SETUP STEP'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 0 && (
                <div className="text-center space-y-4">
                  <p className="text-xl font-medium text-black">
                    Please connect your wallet using the button in the
                    navigation bar to continue.
                  </p>
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-[#10b981] rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_#4a5568]">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <p className="text-xl font-medium text-black">
                      Create your personal Hedera blockchain account for energy
                      trading.
                    </p>
                    <p className="text-base text-gray-600">
                      This will create a unique blockchain account linked to
                      your wallet with 10 HBAR starting balance.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      onClick={createHederaAccount}
                      disabled={setupSteps[1].loading}
                      className="bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
                    >
                      {setupSteps[1].loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          CREATING ACCOUNT...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-5 w-5" />
                          CREATE HEDERA ACCOUNT
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <p className="text-xl font-medium text-black">
                      Associate your account with WEC (Wattr Energy Credits)
                      tokens.
                    </p>
                    <p className="text-base text-gray-600">
                      This allows you to receive, hold, and trade energy tokens
                      on the blockchain.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      onClick={associateToken}
                      disabled={setupSteps[2].loading}
                      className="bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
                    >
                      {setupSteps[2].loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ASSOCIATING TOKEN...
                        </>
                      ) : (
                        <>
                          <Leaf className="mr-2 h-5 w-5" />
                          ASSOCIATE WEC TOKEN
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <p className="text-xl font-medium text-black">
                      Complete your energy trader profile.
                    </p>
                    <p className="text-base text-gray-600">
                      Tell us about yourself to personalize your trading
                      experience.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="font-bold font-mono text-black"
                      >
                        FULL NAME *
                      </Label>
                      <Input
                        id="name"
                        placeholder="ENTER YOUR NAME"
                        value={userProfile.name}
                        onChange={e =>
                          setUserProfile(prev => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="bg-white border-4 border-[#10b981] text-black placeholder:text-gray-500 font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="location"
                        className="font-bold font-mono text-black"
                      >
                        LOCATION *
                      </Label>
                      <Input
                        id="location"
                        placeholder="CITY, STATE"
                        value={userProfile.location}
                        onChange={e =>
                          setUserProfile(prev => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="bg-white border-4 border-[#10b981] text-black placeholder:text-gray-500 font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-bold font-mono text-black">
                      TRADER TYPE
                    </Label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card
                        className={`cursor-pointer transition-all border-4 ${
                          userProfile.isConsumer
                            ? 'border-[#10b981] bg-green-50 shadow-[8px_8px_0px_0px_#10b981]'
                            : 'border-black bg-white shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568]'
                        }`}
                        onClick={() =>
                          setUserProfile(prev => ({
                            ...prev,
                            isConsumer: !prev.isConsumer,
                          }))
                        }
                      >
                        <CardContent className="p-6 text-center">
                          <Home
                            className={`h-8 w-8 mx-auto mb-3 ${userProfile.isConsumer ? 'text-[#10b981]' : 'text-black'}`}
                          />
                          <h3 className="font-black font-mono text-black mb-2">
                            ENERGY CONSUMER
                          </h3>
                          <p className="text-sm text-gray-600">
                            Buy renewable energy from producers
                          </p>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all border-4 ${
                          userProfile.isProducer
                            ? 'border-[#10b981] bg-green-50 shadow-[8px_8px_0px_0px_#10b981]'
                            : 'border-black bg-white shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568]'
                        }`}
                        onClick={() =>
                          setUserProfile(prev => ({
                            ...prev,
                            isProducer: !prev.isProducer,
                          }))
                        }
                      >
                        <CardContent className="p-6 text-center">
                          <Leaf
                            className={`h-8 w-8 mx-auto mb-3 ${userProfile.isProducer ? 'text-[#10b981]' : 'text-black'}`}
                          />
                          <h3 className="font-black font-mono text-black mb-2">
                            ENERGY PRODUCER
                          </h3>
                          <p className="text-sm text-gray-600">
                            Sell your renewable energy surplus
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={completeProfileSetup}
                      disabled={
                        setupSteps[3].loading ||
                        !userProfile.name.trim() ||
                        !userProfile.location.trim()
                      }
                      className="bg-black hover:bg-[#2d3748] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
                    >
                      {setupSteps[3].loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          COMPLETING SETUP...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          COMPLETE SETUP
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Setup Complete */}
        {isStepCompleted && (
          <Card className="bg-[#10b981] border-4 border-black shadow-[12px_12px_0px_0px_#4a5568] text-center">
            <CardContent className="p-12">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_#4a5568] mx-auto">
                  <CheckCircle className="h-12 w-12 text-[#10b981]" />
                </div>
                <div>
                  <h2 className="text-4xl font-black font-mono text-white mb-4">
                    SETUP COMPLETE!
                  </h2>
                  <p className="text-xl font-bold text-white mb-2">
                    Welcome to the future of energy trading
                  </p>
                  <p className="text-base text-green-100">
                    Redirecting you to your dashboard...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
