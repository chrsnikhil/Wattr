'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Sun,
  Leaf,
  Database,
  Network,
  Shield,
  Rocket,
  Home,
  Battery,
  TrendingUp,
} from 'lucide-react';

/**
 * ENERGYFI DESIGN SYSTEM STYLE GUIDE
 *
 * Use this component as a reference for creating consistent UI elements
 * that match the EnergyFi branding and aesthetic.
 */
export default function EnergyFiStyleGuide() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] bg-[linear-gradient(#4a5568_1px,transparent_1px),linear-gradient(90deg,#4a5568_1px,transparent_1px)] bg-[size:20px_20px] p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black text-black font-mono tracking-wider mb-4">
            ENERGYFI DESIGN SYSTEM
          </h1>
          <p className="text-xl text-black font-mono font-bold">
            STYLE GUIDE & COMPONENT LIBRARY
          </p>
        </div>

        {/* Color Palette */}
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-black">
              COLOR PALETTE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  name: 'PRIMARY GREEN',
                  hex: '#10b981',
                  class: 'bg-[#10b981]',
                  textColor: 'text-white',
                },
                {
                  name: 'BLACK',
                  hex: '#000000',
                  class: 'bg-black',
                  textColor: 'text-white',
                },
                {
                  name: 'WHITE',
                  hex: '#ffffff',
                  class: 'bg-white border border-black',
                  textColor: 'text-black',
                },
                {
                  name: 'SHADOW GRAY',
                  hex: '#4a5568',
                  class: 'bg-[#4a5568]',
                  textColor: 'text-white',
                },
                {
                  name: 'LIGHT GRAY',
                  hex: '#f5f5f5',
                  class: 'bg-[#f5f5f5] border border-black',
                  textColor: 'text-black',
                },
                {
                  name: 'DARK GRAY',
                  hex: '#2d3748',
                  class: 'bg-[#2d3748]',
                  textColor: 'text-white',
                },
                {
                  name: 'GRAY 300',
                  hex: '#d1d5db',
                  class: 'bg-gray-300 border border-black',
                  textColor: 'text-black',
                },
                {
                  name: 'GRAY 500',
                  hex: '#6b7280',
                  class: 'bg-gray-500',
                  textColor: 'text-white',
                },
              ].map(color => (
                <div key={color.name} className="text-center">
                  <div
                    className={`w-full h-16 ${color.class} border-2 border-black shadow-[4px_4px_0px_0px_#4a5568] mb-2 flex items-center justify-center`}
                  >
                    <span className={`text-xs font-bold ${color.textColor}`}>
                      SAMPLE
                    </span>
                  </div>
                  <p className="text-xs font-bold font-mono text-black">
                    {color.name}
                  </p>
                  <p className="text-xs font-mono text-black">{color.hex}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-black">
              TYPOGRAPHY
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-6xl font-black font-mono text-black tracking-wider">
                  HEADING 1 - MONO BLACK
                </h1>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded border border-black">
                  text-6xl font-black font-mono tracking-wider text-black
                </code>
              </div>
              <div>
                <h2 className="text-4xl font-black font-mono text-black">
                  Heading 2 - Mono Black
                </h2>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded border border-black">
                  text-4xl font-black font-mono text-black
                </code>
              </div>
              <div>
                <h3 className="text-2xl font-black font-mono text-black">
                  Heading 3 - Mono Black
                </h3>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded border border-black">
                  text-2xl font-black font-mono text-black
                </code>
              </div>
              <div>
                <p className="text-xl font-medium text-black">
                  Body Text Large - Regular weight for readable content
                </p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded border border-black">
                  text-xl font-medium text-black
                </code>
              </div>
              <div>
                <p className="text-base font-medium text-black">
                  Body Text - Standard paragraph text
                </p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded border border-black">
                  text-base font-medium text-black
                </code>
              </div>
              <div>
                <p className="text-sm font-mono font-bold text-[#10b981]">
                  TECHNICAL TEXT - MONO BOLD GREEN
                </p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded border border-black">
                  text-sm font-mono font-bold text-[#10b981]
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-black">
              BUTTONS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4">
              {/* Primary Button */}
              <div className="space-y-2">
                <Button className="bg-black hover:bg-[#2d3748] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all">
                  <Rocket className="mr-2 h-5 w-5" />
                  PRIMARY BUTTON
                </Button>
                <code className="block text-xs bg-gray-100 p-2 rounded border border-black">
                  bg-black border-4 border-black
                  shadow-[8px_8px_0px_0px_#4a5568]
                </code>
              </div>

              {/* Secondary Button */}
              <div className="space-y-2">
                <Button className="bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all">
                  <Zap className="mr-2 h-5 w-5" />
                  SECONDARY
                </Button>
                <code className="block text-xs bg-gray-100 p-2 rounded border border-black">
                  bg-[#10b981] border-4 border-black
                  shadow-[8px_8px_0px_0px_#4a5568]
                </code>
              </div>

              {/* Outline Button */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="bg-white border-4 border-black text-black hover:bg-gray-100 font-black font-mono px-8 py-4 shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
                >
                  <Database className="mr-2 h-5 w-5" />
                  OUTLINE
                </Button>
                <code className="block text-xs bg-gray-100 p-2 rounded border border-black">
                  bg-white border-4 border-black
                  shadow-[8px_8px_0px_0px_#4a5568]
                </code>
              </div>

              {/* Small Button */}
              <div className="space-y-2">
                <Button className="bg-black text-white font-black font-mono px-4 py-2 text-sm border-2 border-black shadow-[4px_4px_0px_0px_#4a5568] hover:shadow-[6px_6px_0px_0px_#4a5568] transition-all">
                  SMALL
                </Button>
                <code className="block text-xs bg-gray-100 p-2 rounded border border-black">
                  px-4 py-2 text-sm border-2 shadow-[4px_4px_0px_0px_#4a5568]
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-black">
              CARDS & CONTAINERS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Standard Card */}
              <div className="space-y-2">
                <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-16 h-16 bg-[#10b981] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                      <Network className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-black font-mono">
                      STANDARD CARD
                    </h3>
                    <p className="text-black font-medium">
                      Description text with proper styling and contrast.
                    </p>
                  </CardContent>
                </Card>
                <code className="block text-xs bg-gray-100 p-2 rounded border border-black">
                  bg-white border-4 border-black
                  shadow-[8px_8px_0px_0px_#4a5568]
                </code>
              </div>

              {/* Dark Card */}
              <div className="space-y-2">
                <Card className="bg-black border-4 border-[#10b981] shadow-[8px_8px_0px_0px_#4a5568]">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-16 h-16 bg-[#10b981] border-4 border-white flex items-center justify-center shadow-[4px_4px_0px_0px_white]">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-white font-mono">
                      DARK CARD
                    </h3>
                    <p className="text-gray-300 font-medium">
                      White text on dark background variant.
                    </p>
                  </CardContent>
                </Card>
                <code className="block text-xs bg-gray-100 p-2 rounded border border-black">
                  bg-black border-4 border-[#10b981]
                  shadow-[8px_8px_0px_0px_#4a5568]
                </code>
              </div>

              {/* Stat Card */}
              <div className="space-y-2">
                <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] text-center">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-16 h-16 bg-black border-4 border-black mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-black font-mono">
                      99.9%
                    </h3>
                    <p className="text-sm font-bold font-mono text-black">
                      STAT CARD
                    </p>
                  </CardContent>
                </Card>
                <code className="block text-xs bg-gray-100 p-2 rounded border border-black">
                  Centered content with large number display
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-black">
              FORM ELEMENTS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="ENTER TEXT HERE"
                  className="bg-white border-4 border-[#10b981] text-black placeholder:text-gray-500 font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                />
                <code className="block text-xs bg-gray-100 p-2 rounded border border-black">
                  border-4 border-[#10b981] shadow-[4px_4px_0px_0px_#4a5568]
                </code>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="ALTERNATIVE INPUT STYLE"
                  className="bg-white border-4 border-black text-black placeholder:text-gray-500 font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                />
                <code className="block text-xs bg-gray-100 p-2 rounded border border-black">
                  border-4 border-black shadow-[4px_4px_0px_0px_#4a5568]
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-black">
              BADGES & LABELS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Badge className="bg-[#10b981] text-white font-bold font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                  <Leaf className="mr-1 h-3 w-3" />
                  PRIMARY BADGE
                </Badge>
                <code className="block text-xs bg-gray-100 p-1 rounded border border-black">
                  bg-[#10b981] border-2 border-black
                </code>
              </div>

              <div className="space-y-2">
                <Badge className="bg-black text-white font-bold font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]">
                  <Shield className="mr-1 h-3 w-3" />
                  DARK BADGE
                </Badge>
                <code className="block text-xs bg-gray-100 p-1 rounded border border-black">
                  bg-black border-2 border-black
                </code>
              </div>

              <div className="space-y-2">
                <Badge
                  variant="outline"
                  className="bg-white border-2 border-black text-black font-bold font-mono px-3 py-1 shadow-[2px_2px_0px_0px_#4a5568]"
                >
                  OUTLINE BADGE
                </Badge>
                <code className="block text-xs bg-gray-100 p-1 rounded border border-black">
                  bg-white border-2 border-black
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Icons */}
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-black">
              ICONS & CONTAINERS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Sun, color: 'bg-[#10b981]', name: 'GREEN BG' },
                { icon: Zap, color: 'bg-black', name: 'BLACK BG' },
                {
                  icon: Home,
                  color: 'bg-white',
                  name: 'WHITE BG',
                  textColor: 'text-black',
                },
                { icon: Battery, color: 'bg-[#4a5568]', name: 'GRAY BG' },
              ].map((item, index) => (
                <div key={index} className="text-center space-y-2">
                  <div
                    className={`w-16 h-16 ${item.color} border-4 border-black mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#4a5568]`}
                  >
                    <item.icon
                      className={`w-8 h-8 ${item.textColor || 'text-white'}`}
                    />
                  </div>
                  <p className="text-xs font-bold font-mono text-black">
                    {item.name}
                  </p>
                  <code className="block text-xs bg-gray-100 p-1 rounded border border-black">
                    {item.color} border-4 border-black
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shadows & Effects */}
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-black">
              SHADOWS & EFFECTS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-full h-16 bg-white border-4 border-black shadow-[4px_4px_0px_0px_#4a5568] flex items-center justify-center">
                  <span className="font-bold text-black">SMALL SHADOW</span>
                </div>
                <code className="block text-xs bg-gray-100 p-2 rounded border border-black">
                  shadow-[4px_4px_0px_0px_#4a5568]
                </code>
              </div>

              <div className="space-y-2">
                <div className="w-full h-16 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] flex items-center justify-center">
                  <span className="font-bold text-black">MEDIUM SHADOW</span>
                </div>
                <code className="block text-xs bg-gray-100 p-2 rounded border border-black">
                  shadow-[8px_8px_0px_0px_#4a5568]
                </code>
              </div>

              <div className="space-y-2">
                <div className="w-full h-16 bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568] flex items-center justify-center">
                  <span className="font-bold text-black">LARGE SHADOW</span>
                </div>
                <code className="block text-xs bg-gray-100 p-2 rounded border border-black">
                  shadow-[12px_12px_0px_0px_#4a5568]
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout Patterns */}
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-black">
              LAYOUT PATTERNS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-bold font-mono text-black mb-2">
                  BACKGROUND PATTERN
                </h4>
                <code className="block text-sm bg-gray-100 p-2 rounded border border-black">
                  bg-[#f5f5f5]
                  bg-[linear-gradient(#4a5568_1px,transparent_1px),linear-gradient(90deg,#4a5568_1px,transparent_1px)]
                  bg-[size:20px_20px]
                </code>
              </div>

              <div>
                <h4 className="font-bold font-mono text-black mb-2">
                  CONTAINER SPACING
                </h4>
                <code className="block text-sm bg-gray-100 p-2 rounded border border-black">
                  max-w-6xl mx-auto space-y-12 (for main containers)
                </code>
              </div>

              <div>
                <h4 className="font-bold font-mono text-black mb-2">
                  SECTION PADDING
                </h4>
                <code className="block text-sm bg-gray-100 p-2 rounded border border-black">
                  py-20 px-6 (for main sections)
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card className="bg-black border-4 border-[#10b981] shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="text-2xl font-black font-mono text-white">
              USAGE GUIDELINES
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-bold font-mono text-[#10b981]">DO'S</h4>
                <ul className="space-y-2 text-white font-medium">
                  <li>• Use monospace font for headings</li>
                  <li>• Apply 4px borders for main elements</li>
                  <li>• Use gray shadows for depth</li>
                  <li>• Maintain high contrast ratios</li>
                  <li>• Use green for primary actions</li>
                  <li>• Keep consistent spacing patterns</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold font-mono text-[#10b981]">DON'TS</h4>
                <ul className="space-y-2 text-white font-medium">
                  <li>• Don't use thin borders (less than 2px)</li>
                  <li>• Avoid low contrast color combinations</li>
                  <li>• Don't mix different shadow styles</li>
                  <li>• Avoid rounded corners (keep sharp edges)</li>
                  <li>• Don't use colors outside the palette</li>
                  <li>• Avoid inconsistent font weights</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
