import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Users, Globe, Cpu, TrendingUp, RefreshCw, 
  Zap, PieChart as PieIcon, ArrowUpRight, MousePointer2, 
  Activity, Wallet
} from "lucide-react";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area, 
  Cell, ComposedChart 
} from "recharts";

interface UsageStat {
  username: string;
  user_id: number;
  base_url: string;
  pages_scraped: number;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
}

const BulkStats = () => {
  const [data, setData] = useState<UsageStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("all");

  const fetchBulkStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://backendproperty.bulkscraper.cloud/api/usage/stats');
      const statsData = await response.json();
      setData(statsData);
    } catch (error) {
      toast.error("Failed to fetch bulk usage statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkStats();
  }, []);

  // --- Calculations ---

  const userList = useMemo(() => Array.from(new Set(data.map(d => d.username))), [data]);

  const filteredData = useMemo(() => {
    return selectedUser === "all" ? data : data.filter(d => d.username === selectedUser);
  }, [data, selectedUser]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalTokens = filteredData.reduce((acc, curr) => acc + curr.input_tokens + curr.output_tokens, 0);
    const totalPages = filteredData.reduce((acc, curr) => acc + curr.pages_scraped, 0);
    const totalSites = new Set(filteredData.map(d => d.base_url)).size;
    const avgIntensity = totalTokens / (totalPages || 1);

    return { totalTokens, totalPages, totalSites, avgIntensity };
  }, [filteredData]);

  // Leaderboard Data (User Comparison)
  const leaderboard = useMemo(() => {
    const userMap: Record<string, any> = {};
    data.forEach(d => {
      if (!userMap[d.username]) userMap[d.username] = { name: d.username, tokens: 0, pages: 0 };
      userMap[d.username].tokens += (d.input_tokens + d.output_tokens);
      userMap[d.username].pages += d.pages_scraped;
    });
    return Object.values(userMap).sort((a: any, b: any) => b.tokens - a.tokens);
  }, [data]);

  // Time-Series Data
  const timeData = useMemo(() => {
    const daily: Record<string, any> = {};
    [...filteredData].reverse().forEach(d => {
      const date = new Date(d.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
      if (!daily[date]) daily[date] = { date, tokens: 0, pages: 0 };
      daily[date].tokens += (d.input_tokens + d.output_tokens);
      daily[date].pages += d.pages_scraped;
    });
    return Object.values(daily);
  }, [filteredData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Syncing Usage Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            BulkScraper Usage Cloud
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" /> Global token consumption and scraper efficiency metrics.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[200px] border-primary/20 bg-card shadow-sm">
              <Users className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Select User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Global Users</SelectItem>
              {userList.map(user => (
                <SelectItem key={user} value={user}>{user}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchBulkStats} className="border-primary/20">
            <RefreshCw className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-bl-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" />
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total OpenAI Tokens</p>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold">{metrics.totalTokens.toLocaleString()}</h3>
              <Cpu className="h-5 w-5 text-primary opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Web Pages</p>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-blue-600">{metrics.totalPages.toLocaleString()}</h3>
              <Globe className="h-5 w-5 text-blue-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Token Intensity</p>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-orange-600">
                {Math.round(metrics.avgIntensity)}
                <span className="text-xs font-normal ml-1 text-muted-foreground">T/Pg</span>
              </h3>
              <Zap className="h-5 w-5 text-orange-600 opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Base Websites</p>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-emerald-600">{metrics.totalSites}</h3>
              <TrendingUp className="h-5 w-5 text-emerald-600 opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Main Consumption Graph */}
        <Card className="md:col-span-8 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Resource Trend</CardTitle>
              <CardDescription>Daily comparison of Tokens vs Pages</CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/30">Last 30 Days</Badge>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeData}>
                <defs>
                  <linearGradient id="colorTok" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} 
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="tokens" name="Tokens" fill="url(#colorTok)" stroke="hsl(var(--primary))" strokeWidth={3} />
                <Bar yAxisId="right" dataKey="pages" name="Pages" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Global Leaderboard */}
        <Card className="md:col-span-4 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Rankings
            </CardTitle>
            <CardDescription>Highest resource consumers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {leaderboard.map((user: any, i) => (
                <div key={user.name} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px]">{i+1}</span>
                      {user.name}
                    </span>
                    <span className="font-mono text-muted-foreground">{user.tokens.toLocaleString()}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${(user.tokens / leaderboard[0].tokens) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Usage Table */}
        <Card className="md:col-span-12 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Detailed Scraper Activity</CardTitle>
            <CardDescription>Most recent individual website processing events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/40">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Target Website</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Pages</TableHead>
                    <TableHead className="text-right">Input Tokens</TableHead>
                    <TableHead className="text-right">Output Tokens</TableHead>
                    <TableHead className="text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.slice(0, 20).map((row, i) => (
                    <TableRow key={i} className="group hover:bg-muted/30">
                      <TableCell className="font-medium text-primary flex items-center gap-2">
                        <Globe className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {row.base_url}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">{row.username}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{row.pages_scraped}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{row.input_tokens.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{row.output_tokens.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BulkStats;