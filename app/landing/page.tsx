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
  Crown,
  Eye,
  Activity,
} from 'lucide-react';

export default function LandingPage() {
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
              WATTR
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="border-4 border-black bg-white hover:bg-[#f5f5f5] font-black font-mono shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
              onClick={() => (window.location.href = '/dashboard')}
            >
              <Activity className="w-4 h-4 mr-2" />
              DASHBOARD
            </Button>
            <ConnectWalletButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto px-6 py-20 text-center"
      >
        <div className="mb-8">
          <Badge className="bg-[#10b981] text-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] text-lg px-6 py-2 font-black font-mono mb-6">
            DECENTRALIZED ENERGY TRADING
          </Badge>
          <h1 className="text-6xl font-black font-mono text-black leading-tight tracking-wider mb-6">
            TRADE ENERGY
            <br />
            <span className="text-[#10b981]">EARN CRYPTO</span>
          </h1>
          <p className="text-xl font-medium text-black max-w-2xl mx-auto mb-8">
            Turn your solar panels into a money-making machine. Sell excess
            energy directly to your neighbors using blockchain technology.
          </p>
        </div>

        <div className="flex justify-center space-x-4 mb-16">
          <Button
            onClick={() => (window.location.href = '/dashboard')}
            className="bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-8 py-4 text-lg border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
          >
            <Rocket className="w-5 h-5 mr-2" />
            START TRADING
          </Button>
          <Button
            variant="outline"
            className="border-4 border-black bg-white hover:bg-[#f5f5f5] text-black font-black font-mono px-8 py-4 text-lg shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
            onClick={() => {
              document
                .getElementById('demo-section')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            VIEW DEMO
          </Button>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-black font-mono text-black text-center mb-16 tracking-wider">
          FEATURES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Sun className="w-12 h-12 text-[#10b981]" />,
              title: 'SOLAR INTEGRATION',
              description:
                'Connect your solar panels and start selling excess energy automatically using NREL real-time data.',
            },
            {
              icon: <Shield className="w-12 h-12 text-[#10b981]" />,
              title: 'HEDERA BLOCKCHAIN',
              description:
                'All transactions are secured by Hedera blockchain technology with fast, low-cost transactions.',
            },
            {
              icon: <Network className="w-12 h-12 text-[#10b981]" />,
              title: 'P2P MARKETPLACE',
              description:
                'Direct peer-to-peer energy trading without middlemen or utility companies taking a cut.',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-black font-mono text-black mb-3">
                    {feature.title}
                  </h3>
                  <p className="font-medium text-black">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-black font-mono text-black text-center mb-16 tracking-wider">
          HOW IT WORKS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              icon: <Home className="w-8 h-8 text-white" />,
              title: 'CONNECT WALLET',
              description:
                'Connect your Hedera wallet using Privy authentication',
            },
            {
              step: '02',
              icon: <Battery className="w-8 h-8 text-white" />,
              title: 'CHOOSE ROLE',
              description: 'Select prosumer to trade or viewer for demo access',
            },
            {
              step: '03',
              icon: <DollarSign className="w-8 h-8 text-white" />,
              title: 'TRADE ENERGY',
              description: 'List excess energy or buy from verified producers',
            },
            {
              step: '04',
              icon: <Rocket className="w-8 h-8 text-white" />,
              title: 'EARN TOKENS',
              description: 'Get paid in Hedera tokens for your clean energy',
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-[#10b981] border-4 border-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[8px_8px_0px_0px_#4a5568]">
                {step.icon}
              </div>
              <div className="text-sm font-black font-mono text-[#10b981] mb-2">
                STEP {step.step}
              </div>
              <h3 className="text-lg font-black font-mono text-black mb-2">
                {step.title}
              </h3>
              <p className="font-medium text-black text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Roles Demo Section */}
      <div
        id="demo-section"
        className="bg-black border-t-4 border-b-4 border-[#4a5568] py-16"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black font-mono text-white text-center mb-16 tracking-wider">
            USER ROLES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Prosumer Role */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white border-4 border-[#10b981] shadow-[8px_8px_0px_0px_#4a5568] h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black font-mono text-black">
                        PROSUMER
                      </h3>
                      <p className="text-sm font-bold font-mono text-[#4a5568]">
                        FULL ACCESS TRADING
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      'Create energy listings',
                      'Buy and sell energy',
                      'Access full marketplace',
                      'View analytics & metrics',
                      'Hedera token transactions',
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[#10b981] flex-shrink-0" />
                        <span className="font-medium text-black">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Badge className="bg-[#10b981] text-white border-4 border-black font-black font-mono px-4 py-2">
                    RECOMMENDED FOR TRADERS
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>

            {/* Viewer Role */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white border-4 border-blue-500 shadow-[8px_8px_0px_0px_#4a5568] h-full">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-500 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black font-mono text-black">
                        VIEWER
                      </h3>
                      <p className="text-sm font-bold font-mono text-[#4a5568]">
                        DEMO ACCESS ONLY
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      'Browse energy marketplace',
                      'View real-time smart meter data',
                      'Access analytics dashboard',
                      'See trading activity',
                      'Demo platform features',
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="font-medium text-black">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Badge className="bg-blue-500 text-white border-4 border-black font-black font-mono px-4 py-2">
                    PERFECT FOR DEMOS
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          {[
            {
              number: '5',
              label: 'NREL DATA SOURCES',
              icon: <Gauge className="w-6 h-6" />,
            },
            {
              number: '30s',
              label: 'REFRESH RATE',
              icon: <Activity className="w-6 h-6" />,
            },
            {
              number: '100%',
              label: 'RENEWABLE VERIFIED',
              icon: <Leaf className="w-6 h-6" />,
            },
            {
              number: 'LIVE',
              label: 'HEDERA TESTNET',
              icon: <Network className="w-6 h-6" />,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568]">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#10b981] border-4 border-black mx-auto flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_#4a5568]">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-black font-mono text-black mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm font-black font-mono text-[#4a5568]">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#10b981] border-t-4 border-b-4 border-black py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black font-mono text-white mb-6 tracking-wider">
            READY TO START EARNING?
          </h2>
          <p className="text-xl font-medium text-white mb-8 max-w-2xl mx-auto">
            Join the future of decentralized energy trading on Hedera. Connect
            your wallet and choose your role to get started.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => (window.location.href = '/dashboard')}
              className="bg-white hover:bg-[#f5f5f5] text-black font-black font-mono px-8 py-4 text-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] transition-all"
            >
              <Rocket className="w-5 h-5 mr-2" />
              GET STARTED NOW
            </Button>
            <Button
              variant="outline"
              className="border-4 border-white bg-transparent hover:bg-white/10 text-white hover:text-white font-black font-mono px-8 py-4 text-lg shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] transition-all"
              onClick={() => {
                window.open('https://github.com/chrsnikhil/Wattr', '_blank');
              }}
            >
              <Shield className="w-5 h-5 mr-2" />
              VIEW ON GITHUB
            </Button>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h3 className="text-2xl font-black font-mono text-black mb-4 tracking-wider">
          STAY UPDATED
        </h3>
        <p className="font-medium text-black mb-6">
          Get the latest updates on Hedera energy trading and platform
          developments.
        </p>
        <div className="flex max-w-md mx-auto">
          <Input
            placeholder="Enter your email..."
            className="flex-1 bg-white border-4 border-black text-black placeholder:text-[#4a5568] font-medium border-r-0 shadow-none"
          />
          <Button className="bg-black hover:bg-[#2d3748] text-white font-black font-mono border-4 border-black border-l-0 shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all">
            SUBSCRIBE
          </Button>
        </div>
      </div>
    </div>
  );
}
