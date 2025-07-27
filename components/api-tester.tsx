'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ApiTester() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [source, setSource] = useState('');
  const [postData, setPostData] = useState(
    '{\n  "userId": "test_user",\n  "energyAmount": 10.5,\n  "source": "solar"\n}',
  );

  const testGetEndpoint = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (source) params.append('source', source);

      const url = `/api/smart-meter${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setResponse({ method: 'GET', url, status: res.status, data });
    } catch (error) {
      setResponse({
        method: 'GET',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const testPostEndpoint = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/smart-meter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: postData,
      });
      const data = await res.json();
      setResponse({
        method: 'POST',
        url: '/api/smart-meter',
        status: res.status,
        data,
        body: postData,
      });
    } catch (error) {
      setResponse({
        method: 'POST',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <div className="mb-6">
        <h1 className="text-6xl font-black font-mono text-black tracking-wider mb-4">
          SMART METER API TESTER
        </h1>
        <p className="text-xl font-bold font-mono text-black">
          TEST THE SMART METER API ENDPOINTS
        </p>
      </div>

      <Tabs defaultValue="get" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white border-4 border-black shadow-[4px_4px_0px_0px_#4a5568]">
          <TabsTrigger
            value="get"
            className="font-black font-mono text-black data-[state=active]:bg-[#10b981] data-[state=active]:text-white"
          >
            GET REQUEST
          </TabsTrigger>
          <TabsTrigger
            value="post"
            className="font-black font-mono text-black data-[state=active]:bg-[#10b981] data-[state=active]:text-white"
          >
            POST REQUEST
          </TabsTrigger>
        </TabsList>

        <TabsContent value="get">
          <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
            <CardHeader>
              <CardTitle className="text-2xl font-black font-mono text-black">
                GET /api/smart-meter
              </CardTitle>
              <CardDescription className="font-bold font-mono text-black">
                FETCH SMART METER DATA WITH OPTIONAL FILTERS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="userId"
                    className="font-black font-mono text-black"
                  >
                    USER ID (OPTIONAL)
                  </Label>
                  <Input
                    id="userId"
                    placeholder="e.g., user_001"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    className="bg-white border-4 border-black text-black placeholder:text-gray-500 font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="source"
                    className="font-black font-mono text-black"
                  >
                    ENERGY SOURCE (OPTIONAL)
                  </Label>
                  <Input
                    id="source"
                    placeholder="e.g., solar, wind, hydro"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    className="bg-white border-4 border-black text-black placeholder:text-gray-500 font-bold font-mono shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                  />
                </div>
              </div>
              <Button
                onClick={testGetEndpoint}
                disabled={loading}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
              >
                {loading ? 'TESTING...' : 'TEST GET REQUEST'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="post">
          <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
            <CardHeader>
              <CardTitle className="text-2xl font-black font-mono text-black">
                POST /api/smart-meter
              </CardTitle>
              <CardDescription className="font-bold font-mono text-black">
                SEND SMART METER DATA FOR PROCESSING
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="postData"
                  className="font-black font-mono text-black"
                >
                  REQUEST BODY (JSON)
                </Label>
                <Textarea
                  id="postData"
                  value={postData}
                  onChange={e => setPostData(e.target.value)}
                  rows={8}
                  className="bg-white border-4 border-black text-black font-mono text-sm shadow-[4px_4px_0px_0px_#4a5568] focus:shadow-[6px_6px_0px_0px_#4a5568] transition-all"
                />
              </div>
              <Button
                onClick={testPostEndpoint}
                disabled={loading}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-black font-mono px-8 py-4 border-4 border-black shadow-[8px_8px_0px_0px_#4a5568] hover:shadow-[12px_12px_0px_0px_#4a5568] transition-all"
              >
                {loading ? 'TESTING...' : 'TEST POST REQUEST'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Display */}
      {response && (
        <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#4a5568]">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl font-black font-mono text-black">
              <span>API RESPONSE</span>
              <Badge
                className={`${response.error ? 'bg-black' : 'bg-[#10b981]'} text-white font-black font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]`}
              >
                {response.method}
              </Badge>
              {response.status && (
                <Badge
                  className={`${response.status < 400 ? 'bg-[#10b981]' : 'bg-black'} text-white font-black font-mono px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#4a5568]`}
                >
                  {response.status}
                </Badge>
              )}
            </CardTitle>
            {response.url && (
              <CardDescription className="font-black font-mono text-xs text-black bg-gray-100 p-2 border-2 border-black">
                {response.url}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {response.body && (
                <div>
                  <Label className="text-sm font-black font-mono text-black">
                    REQUEST BODY:
                  </Label>
                  <pre className="mt-1 p-3 bg-gray-100 border-2 border-black text-xs overflow-x-auto font-mono">
                    {response.body}
                  </pre>
                </div>
              )}

              <div>
                <Label className="text-sm font-black font-mono text-black">
                  {response.error ? 'ERROR:' : 'RESPONSE:'}
                </Label>
                <pre className="mt-1 p-3 bg-gray-100 border-2 border-black text-xs overflow-x-auto font-mono">
                  {JSON.stringify(response.data || response.error, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
