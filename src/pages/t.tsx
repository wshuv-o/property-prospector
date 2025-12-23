import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Users, Globe, Cpu, TrendingUp, RefreshCw, 
  Zap, Activity, Clock, Calendar, BarChart as BarChartIcon,
  Search, ExternalLink, ArrowUp
} from "lucide-react";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, AreaChart, Area, ComposedChart 
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

type TimeRange = "today" | "7d" | "30d" | "all";

const BulkStats = () => {
  const [data, setData] = useState<UsageStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

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

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // User Filter
    if (selectedUser !== "all") {
      result = result.filter(d => d.username === selectedUser);
    }

    // Time Filter
    const now = new Date();
    if (timeRange === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      result = result.filter(d => new Date(d.created_at) >= startOfDay);
    } else if (timeRange === "7d") {
      const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
      result = result.filter(d => new Date(d.created_at) >= sevenDaysAgo);
    } else if (timeRange === "30d") {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      result = result.filter(d => new Date(d.created_at) >= thirtyDaysAgo);
    }

    return result;
  }, [data, selectedUser, timeRange]);

  const userList = useMemo(() => Array.from(new Set(data.map(d => d.username))), [data]);

  // --- Calculations ---

  const metrics = useMemo(() => {
    const totalTokens = filteredData.reduce((acc, curr) => acc + curr.input_tokens + curr.output_tokens, 0);
    const totalPages = filteredData.reduce((acc, curr) => acc + curr.pages_scraped, 0);
    const totalSites = new Set(filteredData.map(d => d.base_url)).size;
    return { totalTokens, totalPages, totalSites };
  }, [filteredData]);

  // Top Websites by Token (Scrollable List)
  const topWebsites = useMemo(() => {
    const sitesMap: Record<string, { url: string; tokens: number; pages: number }> = {};
    filteredData.forEach(d => {
      if (!sitesMap[d.base_url]) sitesMap[d.base_url] = { url: d.base_url, tokens: 0, pages: 0 };
      sitesMap[d.base_url].tokens += (d.input_tokens + d.output_tokens);
      sitesMap[d.base_url].pages += d.pages_scraped;
    });
    return Object.values(sitesMap).sort((a, b) => b.tokens - a.tokens);
  }, [filteredData]);

  // User Comparison (Tokens + Unique Website Count)
  const userLeaderboard = useMemo(() => {
    const userMap: Record<string, { name: string; tokens: number; pages: number; uniqueSites: Set<string> }> = {};
    filteredData.forEach(d => {
      if (!userMap[d.username]) {
        userMap[d.username] = { name: d.username, tokens: 0, pages: 0, uniqueSites: new Set() };
      }
      userMap[d.username].tokens += (d.input_tokens + d.output_tokens);
      userMap[d.username].pages += d.pages_scraped;
      userMap[d.username].uniqueSites.add(d.base_url);
    });
    return Object.values(userMap)
      .map(u => ({ ...u, siteCount: u.uniqueSites.size }))
      .sort((a, b) => b.tokens - a.tokens);
  }, [filteredData]);

  // Time-Series Chart Data
  const timeChartData = useMemo(() => {
    const daily: Record<string, any> = {};
    
    [...filteredData].reverse().forEach(d => {
      const dateObj = new Date(d.created_at);
      // Format: If "today", show hours. If others, show dates.
      const label = timeRange === "today" 
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

      if (!daily[label]) daily[label] = { label, tokens: 0, pages: 0 };
      daily[label].tokens += (d.input_tokens + d.output_tokens);
      daily[label].pages += d.pages_scraped;
    });
    return Object.values(daily);
  }, [filteredData, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
             <RefreshCw className="h-12 w-12 text-primary animate-spin" />
             <div className="absolute inset-0 blur-lg bg-primary/20 animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Analyzing Scraping Logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground via-primary to-blue-700 bg-clip-text text-transparent">
            Usage Analytics
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1 text-sm">
            <Activity className="h-4 w-4 text-emerald-500" /> 
            Live monitoring of AI token consumption and crawler depth.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-card border p-2 rounded-xl shadow-sm">
          {/* Time Filter Toggle */}
          <div className="flex items-center gap-1 border-r pr-3 mr-1">
            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
            <div className="flex gap-1 ml-1">
               {(['today', '7d', '30d', 'all'] as TimeRange[]).map((range) => (
                 <Button 
                   key={range}
                   variant={timeRange === range ? "default" : "ghost"} 
                   size="sm" 
                   className="h-8 text-xs capitalize"
                   onClick={() => setTimeRange(range)}
                 >
                   {range}
                 </Button>
               ))}
            </div>
          </div>

          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[180px] h-9 border-none bg-muted/50 focus:ring-0">
              <Users className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Global (All Users)</SelectItem>
              {userList.map(user => (
                <SelectItem key={user} value={user}>{user}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={fetchBulkStats} className="h-9 w-9 rounded-full hover:rotate-180 transition-transform duration-500">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Tokens", val: metrics.totalTokens, icon: Cpu, color: "text-primary", bg: "bg-primary/10" },
          { title: "Pages Scraped", val: metrics.totalPages, icon: Globe, color: "text-blue-600", bg: "bg-blue-600/10" },
          { title: "Unique Domains", val: metrics.totalSites, icon: Search, color: "text-emerald-600", bg: "bg-emerald-600/10" },
          { title: "Efficiency", val: Math.round(metrics.totalTokens / (metrics.totalPages || 1)), unit: "T/Pg", icon: Zap, color: "text-orange-600", bg: "bg-orange-600/10" }
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-md bg-card/50 backdrop-blur-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.title}</p>
                <div className={`${item.bg} p-2 rounded-lg`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold">{item.val.toLocaleString()}</h3>
                {item.unit && <span className="text-xs text-muted-foreground font-medium">{item.unit}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Resource Trend Chart */}
        <Card className="md:col-span-8 border-none shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Resource Consumption</CardTitle>
                <CardDescription>
                  {timeRange === 'today' ? 'Hourly activity for current day' : 'Daily resource distribution'}
                </CardDescription>
              </div>
              <Badge variant="outline" className="capitalize">{timeRange} View</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeChartData}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={11} minTickGap={30} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} fontSize={11} hide />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} fontSize={11} hide />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }} 
                />
                <Area yAxisId="left" type="monotone" dataKey="tokens" name="Tokens" fill="url(#colorTokens)" stroke="hsl(var(--primary))" strokeWidth={3} />
                <Bar yAxisId="right" dataKey="pages" name="Pages" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={timeRange === 'today' ? 10 : 25} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Websites Leaderboard (SCROLLABLE) */}
        <Card className="md:col-span-4 border-none shadow-lg flex flex-col h-[480px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Resource-Heavy Sites
            </CardTitle>
            <CardDescription>Websites consuming most tokens</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
              {topWebsites.map((site, i) => (
                <div key={site.url} className="p-3 rounded-lg bg-muted/30 border border-transparent hover:border-primary/20 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="max-w-[180px]">
                       <p className="text-sm font-bold truncate text-foreground/80 group-hover:text-primary transition-colors">{site.url}</p>
                       <p className="text-[10px] text-muted-foreground uppercase font-semibold">{site.pages} Pages Scraped</p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px]">#{i+1}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-xs font-mono">{site.tokens.toLocaleString()} <span className="text-muted-foreground">Tokens</span></span>
                     <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(site.tokens / topWebsites[0].tokens) * 100}%` }}
                        />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Comparison Section */}
        <Card className="md:col-span-12 border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg">User Efficiency Leaderboard</CardTitle>
            <CardDescription>Comparison of websites scraped vs tokens consumed per user</CardDescription>
          </CardHeader>
          <div className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow>
                  <TableHead className="w-[200px]">User</TableHead>
                  <TableHead className="text-right">Unique Websites</TableHead>
                  <TableHead className="text-right">Total Pages</TableHead>
                  <TableHead className="text-right">Total Tokens</TableHead>
                  <TableHead className="text-right">Avg. Tokens / Page</TableHead>
                  <TableHead className="text-right pr-6">Workload %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userLeaderboard.map((user) => (
                  <TableRow key={user.name} className="hover:bg-muted/50 transition-colors group">
                    <TableCell className="font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs border border-primary/20 capitalize">
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      {user.siteCount}
                    </TableCell>
                    <TableCell className="text-right">{user.pages}</TableCell>
                    <TableCell className="text-right font-mono">{user.tokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                       <Badge variant="outline" className="font-mono border-orange-500/20 text-orange-600">
                         {Math.round(user.tokens / (user.pages || 1))}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">{Math.round((user.tokens / metrics.totalTokens) * 100)}%</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500" style={{ width: `${(user.tokens / metrics.totalTokens) * 100}%` }} />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Raw Log Table */}
        <Card className="md:col-span-12 border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Scraping Events</CardTitle>
              <CardDescription>Most recent individual process logs</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary">View Full Logs</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Target Base URL</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Pages</TableHead>
                    <TableHead className="text-right">Input</TableHead>
                    <TableHead className="text-right">Output</TableHead>
                    <TableHead className="text-right pr-6">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.slice(0, 15).map((row, i) => (
                    <TableRow key={i} className="group cursor-default">
                      <TableCell className="font-medium text-foreground flex items-center gap-2 max-w-[300px] truncate">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {row.base_url}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-tighter">{row.username}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{row.pages_scraped}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs font-mono">{row.input_tokens.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs font-mono">{row.output_tokens.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-xs pr-6">
                        <div className="flex flex-col items-end">
                           <span className="font-medium">{new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           <span className="text-[10px] text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</span>
                        </div>
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