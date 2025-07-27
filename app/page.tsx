'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import ConnectWalletButton from '@/components/connect-wallet-button';
import {
  Zap,
  Sun,
  Leaf,
  TrendingUp,
  Shield,
  Rocket,
  Battery,
  Home,
  DollarSign,
  Network,
  Gauge,
  CheckCircle,
} from 'lucide-react';

export default function EnergyTradingLanding() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a5568_1px,transparent_1px),linear-gradient(90deg,#4a5568_1px,transparent_1px)] bg-[size:20px_20px]">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black font-mono text-black tracking-wider">
              ENERGYFI
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="border-2 border-black shadow-[2px_2px_0px_0px_#4a5568] hover:shadow-[1px_1px_0px_0px_#4a5568] transition-all"
              onClick={() => (window.location.href = '/smart-meter')}
            >
              <Gauge className="w-4 h-4 mr-2" />
              Smart Meter
            </Button>
            <Button
              variant="outline"
              className="border-2 border-black shadow-[2px_2px_0px_0px_#4a5568] hover:shadow-[1px_1px_0px_0px_#4a5568] transition-all"
              onClick={() => (window.location.href = '/energy-metering')}
            >
              <Battery className="w-4 h-4 mr-2" />
              Energy Metering
            </Button>
            <Button
              variant="outline"
              className="border-2 border-black shadow-[2px_2px_0px_0px_#4a5568] hover:shadow-[1px_1px_0px_0px_#4a5568] transition-all"
              onClick={() => (window.location.href = '/energy-trading')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              P2P Trading
            </Button>
            <Button
              variant="outline"
              className="border-2 border-black shadow-[2px_2px_0px_0px_#4a5568] hover:shadow-[1px_1px_0px_0px_#4a5568] transition-all"
              onClick={() => (window.location.href = '/tokens')}
            >
              <Zap className="w-4 h-4 mr-2" />
              Energy Tokens
            </Button>
            <ConnectWalletButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex justify-center space-x-4 mb-8">
              <div className="w-20 h-20 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_#4a5568]">
                <Sun className="w-10 h-10 text-white" />
              </div>
              <div className="w-20 h-20 bg-black border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_#4a5568]">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_#4a5568]">
                <DollarSign className="w-10 h-10 text-black" />
              </div>
            </div>

            <h1 className="text-7xl font-black text-black font-mono tracking-wider mb-6">
              TRADE YOUR
              <br />
              <span className="text-[#10b981]">SOLAR ENERGY</span>
            </h1>

            <p className="text-2xl text-black font-medium max-w-4xl mx-auto mb-8">
              Transform your rooftop solar panels into a revenue stream. Trade
              excess energy with neighbors on the world's most energy-efficient
              blockchain.
            </p>

            <div className="flex justify-center items-center space-x-4 mb-8">
              <Badge className="bg-[#10b981] text-white font-bold font-mono px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                <Leaf className="mr-2 h-4 w-4" />
                CARBON NEGATIVE
              </Badge>
              <Badge className="bg-black text-white font-bold font-mono px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                <Shield className="mr-2 h-4 w-4" />
                HEDERA POWERED
              </Badge>
            </div>

            <div className="flex justify-center space-x-6">
              <Button className="bg-black hover:bg-[#2d3748] text-white font-black font-mono px-12 py-6 text-xl border-4 border-black shadow-[12px_12px_0px_0px_#4a5568] hover:shadow-[16px_16px_0px_0px_#4a5568] transition-all">
                <Rocket className="mr-3 h-6 w-6" />
                START TRADING NOW
              </Button>
              <Button
                variant="outline"
                className="bg-white border-4 border-black text-black hover:bg-gray-100 font-black font-mono px-12 py-6 text-xl shadow-[12px_12px_0px_0px_#4a5568] hover:shadow-[16px_16px_0px_0px_#4a5568] transition-all"
              >
                <Gauge className="mr-3 h-6 w-6" />
                VIEW DEMO
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                number: '10,000+',
                label: 'SOLAR PANELS CONNECTED',
                icon: Sun,
                color: 'bg-[#10b981]',
              },
              {
                number: '2.5 MWh',
                label: 'ENERGY TRADED DAILY',
                icon: Battery,
                color: 'bg-black',
              },
              {
                number: '99.9%',
                label: 'ENERGY EFFICIENCY',
                icon: Leaf,
                color: 'bg-[#10b981]',
              },
              {
                number: '$50K+',
                label: 'EARNED BY USERS',
                icon: DollarSign,
                color: 'bg-white',
                textColor: 'text-black',
              },
            ].map((stat, index) => (
              <motion.div
                key={`stat-${stat.label}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all text-center">
                  <CardContent className="p-6 space-y-4">
                    <div
                      className={`w-16 h-16 ${stat.color} border-4 border-black mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]`}
                    >
                      <stat.icon
                        className={`w-8 h-8 ${stat.color === 'bg-white' ? 'text-black' : 'text-white'}`}
                      />
                    </div>
                    <h3 className="text-3xl font-black text-black font-mono">
                      {stat.number}
                    </h3>
                    <p className="text-sm font-bold font-mono text-black">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-black font-mono tracking-wider mb-4">
              REVOLUTIONARY FEATURES
            </h2>
            <p className="text-xl text-black font-medium">
              Built on Hedera for maximum efficiency and minimal environmental
              impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'REAL-TIME MONITORING',
                description:
                  'Track your solar panel production and energy consumption in real-time with advanced analytics.',
                icon: Gauge,
                color: 'bg-[#10b981]',
              },
              {
                title: 'AUTOMATED TRADING',
                description:
                  'Smart contracts automatically sell your excess energy at optimal prices while you sleep.',
                icon: Network,
                color: 'bg-black',
              },
              {
                title: 'CARBON CREDITS',
                description:
                  'Earn additional revenue through verified carbon credits for your clean energy contribution.',
                icon: Leaf,
                color: 'bg-[#10b981]',
              },
              {
                title: 'NEIGHBORHOOD GRID',
                description:
                  'Connect with local energy consumers and create a sustainable micro-grid community.',
                icon: Home,
                color: 'bg-white',
                textColor: 'text-black',
              },
              {
                title: 'INSTANT PAYMENTS',
                description:
                  "Receive payments instantly through Hedera's lightning-fast and low-cost transactions.",
                icon: Zap,
                color: 'bg-black',
              },
              {
                title: 'ENERGY FORECASTING',
                description:
                  'AI-powered predictions help optimize your energy production and trading strategies.',
                icon: TrendingUp,
                color: 'bg-[#10b981]',
              },
            ].map((feature, index) => (
              <motion.div
                key={`feature-${feature.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all h-full">
                  <CardContent className="p-8 space-y-6">
                    <div
                      className={`w-20 h-20 ${feature.color} border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_#4a5568]`}
                    >
                      <feature.icon
                        className={`w-10 h-10 ${feature.color === 'bg-white' ? 'text-black' : 'text-white'}`}
                      />
                    </div>
                    <h3 className="text-xl font-black text-black font-mono">
                      {feature.title}
                    </h3>
                    <p className="text-black font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hedera Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-black border-4 border-[#10b981] shadow-[16px_16px_0px_0px_#4a5568]">
            <CardContent className="p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <h2 className="text-4xl font-black text-white font-mono tracking-wider">
                    POWERED BY HEDERA
                  </h2>
                  <p className="text-xl text-gray-300 font-medium leading-relaxed">
                    We chose Hedera because it's the world's most
                    energy-efficient blockchain, using 99.99% less energy than
                    Bitcoin while providing enterprise-grade security.
                  </p>
                  <div className="space-y-4">
                    {[
                      '0.001 kWh per transaction vs 700 kWh for Bitcoin',
                      'Carbon negative network operations',
                      'Sub-second transaction finality',
                      'Fixed low fees under $0.01',
                    ].map((benefit, index) => (
                      <div key={`benefit-${benefit.slice(0, 10)}-${index}`} className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-[#10b981]" />
                        <span className="text-white font-medium">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-48 h-48 bg-[#10b981] border-8 border-black mx-auto flex items-center justify-center shadow-[12px_12px_0px_0px_#4a5568] mb-6">
                    <Leaf className="w-24 h-24 text-white" />
                  </div>
                  <p className="text-sm font-mono font-bold text-[#10b981]">
                    CARBON NEGATIVE BLOCKCHAIN
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_#4a5568]">
            <CardContent className="p-12 space-y-8">
              <h2 className="text-4xl font-black text-black font-mono tracking-wider">
                START EARNING FROM YOUR SOLAR PANELS TODAY
              </h2>
              <p className="text-xl text-black font-medium">
                Join thousands of homeowners already earning passive income from
                their excess solar energy.
              </p>

              <div className="flex justify-center space-x-4 max-w-md mx-auto">
                <Input
                  placeholder="ENTER YOUR EMAIL"
                  className="bg-white border-4 border-[#10b981] text-black placeholder:text-gray-500 font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                />
                <Button className="bg-black hover:bg-[#2d3748] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all whitespace-nowrap">
                  GET STARTED
                </Button>
              </div>

              <div className="flex justify-center space-x-6 pt-4">
                <Badge className="bg-[#10b981] text-white font-bold font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                  FREE SETUP
                </Badge>
                <Badge className="bg-black text-white font-bold font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                  NO MONTHLY FEES
                </Badge>
                <Badge className="bg-white text-black font-bold font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                  INSTANT PAYOUTS
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t-4 border-black">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black font-mono text-black tracking-wider">
              ENERGYFI
            </h3>
          </div>
          <p className="text-black font-medium mb-4">
            Democratizing energy trading through blockchain technology
          </p>
          <p className="text-sm font-mono font-bold text-[#10b981]">
            POWERED BY HEDERA • CARBON NEGATIVE • ENERGY EFFICIENT
          </p>
        </div>
      </footer>
    </div>
  );
}
