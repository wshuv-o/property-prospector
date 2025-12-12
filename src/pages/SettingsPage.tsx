// src\pages\SettingsPage.tsx
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Server, Shield, Bell, Database } from 'lucide-react';

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your scraper and system preferences
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Backend Configuration
              </CardTitle>
              <CardDescription>
                Configure the connection to your US-hosted VPS scraper
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="backend-url">Backend API URL</Label>
                <Input 
                  id="backend-url" 
                  placeholder="https://your-vps-ip:3001" 
                  defaultValue=""
                />
                <p className="text-xs text-muted-foreground">
                  URL of your Puppeteer scraper running on US VPS
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input 
                  id="api-key" 
                  type="password"
                  placeholder="Enter your API key" 
                />
              </div>
              <Button>Test Connection</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Scraper Settings
              </CardTitle>
              <CardDescription>
                Configure scraping behavior and retry logic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-retry on Cloudflare</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically retry when Cloudflare challenge is detected
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Stealth Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Use puppeteer-extra-stealth to avoid detection
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="delay">Request Delay (ms)</Label>
                  <Input id="delay" type="number" defaultValue="2000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="retries">Max Retries</Label>
                  <Input id="retries" type="number" defaultValue="3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Sources
              </CardTitle>
              <CardDescription>
                Enable or disable specific search websites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>TruePeopleSearch</Label>
                  <p className="text-xs text-muted-foreground">truepeoplesearch.com</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>FastPeopleSearch</Label>
                  <p className="text-xs text-muted-foreground">fastpeoplesearch.com</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SearchPeopleFree</Label>
                  <p className="text-xs text-muted-foreground">searchpeoplefree.com</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bulk Search Complete</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when bulk search finishes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Error Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify on scraping errors
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
