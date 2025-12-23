import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, Globe, Cpu, TrendingUp, RefreshCw, 
  Zap, ArrowUpRight, Activity, Clock, Calendar, 
  Hash, LayoutDashboard, ExternalLink, ShieldAlert,
  BarChart3, PieChart as PieIcon, Microscope
} from "lucide-react";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, AreaChart, Area, 
  Cell, ComposedChart, PieChart, Pie, ResponsiveContainer as Resp
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
  const [timeRange, setTimeRange] = useState<string>("all");

  const fetchBulkStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://backendproperty.bulkscraper.cloud/api/usage/stats');
      const statsData = await response.json();
      setData(statsData);
    } catch (error) {
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkStats();
  }, []);

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    const now = new Date();
    return data.filter(d => {
      const itemDate = new Date(d.created_at);
      const isUserMatch = selectedUser === "all" || d.username === selectedUser;
      
      let isTimeMatch = true;
      if (timeRange === "today") isTimeMatch = itemDate.toDateString() === now.toDateString();
      else if (timeRange === "7d") isTimeMatch = (now.getTime() - itemDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      else if (timeRange === "30d") isTimeMatch = (now.getTime() - itemDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
      
      return isUserMatch && isTimeMatch;
    });
  }, [data, selectedUser, timeRange]);
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
  // --- KPI Calculations ---
  const userList = useMemo(() => Array.from(new Set(data.map(d => d.username))), [data]);

  const metrics = useMemo(() => {
    const totalTokens = filteredData.reduce((acc, curr) => acc + curr.input_tokens + curr.output_tokens, 0);
    const totalPages = filteredData.reduce((acc, curr) => acc + curr.pages_scraped, 0);
    const totalSites = filteredData.length;
    const tPg = totalTokens / (totalPages || 1);
    return { totalTokens, totalPages, totalSites, tPg };
  }, [filteredData]);

  // --- User-Specific Metrics (For Node Output & Efficiency) ---
  const userAggregates = useMemo(() => {
    const map: Record<string, any> = {};
    filteredData.forEach(d => {
      if (!map[d.username]) map[d.username] = { name: d.username, sites: 0, tokens: 0, pages: 0 };
      map[d.username].sites += 1;
      map[d.username].tokens += (d.input_tokens + d.output_tokens);
      map[d.username].pages += d.pages_scraped;
    });
    return Object.values(map).map(u => ({
      ...u,
      efficiency: Math.round(u.tokens / (u.pages || 1))
    })).sort((a, b) => b.sites - a.sites);
  }, [filteredData]);

  // --- Trend Data (Hourly for Today, Daily for others) ---
  const trendData = useMemo(() => {
    const groups: Record<string, any> = {};
    [...filteredData].reverse().forEach(d => {
      const dateObj = new Date(d.created_at);
      const key = timeRange === "today" 
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      if (!groups[key]) groups[key] = { label: key, tokens: 0, pages: 0 };
      groups[key].tokens += (d.input_tokens + d.output_tokens);
      groups[key].pages += d.pages_scraped;
    });
    return Object.values(groups);
  }, [filteredData, timeRange]);

  const costlySites = useMemo(() => {
    return [...filteredData]
      .map(d => ({
        url: d.base_url,
        user: d.username,
        cost: d.input_tokens + d.output_tokens,
        pages: d.pages_scraped,
        tPg: Math.round((d.input_tokens + d.output_tokens) / (d.pages_scraped || 1))
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [filteredData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <RefreshCw className="h-12 w-12 text-primary animate-spin" />
      <h2 className="text-xl font-bold animate-pulse text-primary">Synchronizing Scraper Cloud...</h2>
    </div>
  );


  return (
    <div className="p-4 space-y-6 max-w-[1800px] mx-auto bg-background pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 bg-card border p-6 rounded-[2rem] shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
 <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground via-primary to-blue-700 bg-clip-text text-transparent">
            Usage Analytics
          </h1>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />Research Analyzer for<a rel="noopener noreferrer" href="https://bulkscraper.cloud/" className="text-primary hover:underline">bulkscraper.cloud</a>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-2xl border">
            <Calendar className="h-4 w-4 ml-2 text-primary" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] border-none bg-transparent focus:ring-0 font-black uppercase text-xs">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-[1px] h-6 bg-border mx-1" />
            <Users className="h-4 w-4 ml-1 text-primary" />
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[160px] border-none bg-transparent focus:ring-0 font-black uppercase text-xs">
                <SelectValue placeholder="Global" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Global (All Nodes)</SelectItem>
                {userList.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={fetchBulkStats} className="rounded-2xl h-12 px-6 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* --- KPI SECTION --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Network Tokens", val: metrics.totalTokens.toLocaleString(), icon: Cpu, color: "text-blue-500", detail: "Global Bandwidth" },
          { label: "Total Pages", val: metrics.totalPages.toLocaleString(), icon: Globe, color: "text-indigo-500", detail: "Scrape Depth" },
          { label: "Base Domains", val: metrics.totalSites.toLocaleString(), icon: Hash, color: "text-emerald-500", detail: "Unique Websites" },
          { label: "Token Intensity", val: Math.round(metrics.tPg).toLocaleString(), icon: Zap, color: "text-orange-500", detail: "Avg T/Pg" },
        ].map((kpi, i) => (
          <Card key={i} className="border-none bg-card shadow-lg hover:shadow-primary/5 transition-all overflow-hidden relative group">
             <div className="absolute top-0 right-0 h-20 w-20 bg-muted/10 rounded-bl-full -mr-6 -mt-6 group-hover:scale-125 transition-transform" />
             <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{kpi.label}</p>
                    <h3 className="text-3xl font-black">{kpi.val}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" /> {kpi.detail}
                    </p>
                  </div>
                  <div className={`p-3 rounded-2xl ${kpi.color} bg-current/10`}>
                    <kpi.icon className="h-6 w-6" />
                  </div>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* --- FIRST CHART SECTION (MAIN CHART + NODE OUTPUT) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Resource Consumption (Left - Huge Chart) */}
        <Card className="lg:col-span-8 shadow-2xl border-none bg-card overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Resource Consumption Trend
                </CardTitle>
                <CardDescription>Correlation between Token Usage and Page Volume</CardDescription>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /><span className="text-[10px] font-bold">TOKENS</span></div>
                 <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500" /><span className="text-[10px] font-bold">PAGES</span></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[450px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData}>
                <defs>
                  <linearGradient id="tokGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={10} tickMargin={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} fontSize={10} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="tokens" fill="url(#tokGrad)" stroke="hsl(var(--primary))" strokeWidth={3} />
                <Bar yAxisId="right" dataKey="pages" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={timeRange === 'today' ? 12 : 30} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Node Output (Right Side) */}
        <Card className="lg:col-span-4 shadow-2xl border-none bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Microscope className="h-5 w-5 text-primary" /> Node Output
            </CardTitle>
            <CardDescription>Websites scraped per node</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-4">
            {userAggregates.map((user, i) => (
              <div key={user.name} className="relative group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-muted-foreground/50">0{i+1}</span>
                    <span className="font-black text-sm uppercase tracking-tight">{user.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black">{user.sites}</span>
                    <span className="text-[10px] text-muted-foreground ml-1 font-bold">SITES</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out group-hover:bg-primary/80" 
                    style={{ width: `${(user.sites / userAggregates[0].sites) * 100}%` }}
                   />
                </div>
                <div className="flex justify-between mt-1 px-1">
                   <span className="text-[9px] font-bold text-muted-foreground uppercase">{user.efficiency} T/Pg Efficiency</span>
                   <span className="text-[9px] font-bold text-muted-foreground">SYSTEM SHARE: {Math.round((user.tokens / metrics.totalTokens) * 100)}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* --- SECOND CHART SECTION (EFFICIENCY + PIE) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Node Efficiency Comparison */}
         <Card className="shadow-2xl border-none bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Efficiency Audit</CardTitle>
              <CardDescription>Ranking nodes by lowest T/Pg (Lower is better)</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userAggregates.sort((a,b) => a.efficiency - b.efficiency)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                  <Bar dataKey="efficiency" name="Tokens per Page" radius={[6, 6, 0, 0]} barSize={50}>
                    {userAggregates.map((entry, index) => (
                      <Cell key={index} fill={entry.efficiency > metrics.tPg ? '#ef4444' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
         </Card>

         {/* System Distribution (Pie) */}
         <Card className="shadow-2xl border-none bg-card">
            <CardHeader>
               <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                 <PieIcon className="h-5 w-5 text-primary" /> Token Used
               </CardTitle>
               <CardDescription>Total system load by user node</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userAggregates}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="tokens"
                    stroke="none" 
                    cornerRadius={6} 
                  >
                    {userAggregates.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
         </Card>
      </div>

      {/* --- TOKEN HEAVYWEIGHTS (SCROLLABLE LIST) --- */}
      <Card className="shadow-2xl border-none bg-card">
         <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-2">
            <div>
              <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" /> Token Heavyweights
              </CardTitle>
              <CardDescription>Ranking individual websites by processing cost</CardDescription>
            </div>
            <Badge variant="destructive" className="animate-pulse font-black px-4 py-1">Critical Consumption</Badge>
         </CardHeader>
         <CardContent>
           <ScrollArea className="h-[450px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
                 {costlySites.map((site, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-muted/20 border border-transparent hover:border-primary/20 transition-all group">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-black text-muted-foreground/60">RANK #{i+1}</span>
                           <Badge variant="outline" className="text-[8px] font-black uppercase px-2 py-0">{site.user}</Badge>
                        </div>
                        <p className="font-black text-sm truncate text-primary uppercase tracking-tight">{site.url}</p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">Pages: {site.pages} • {site.tPg} T/Pg</p>
                      </div>
                      <div className="text-right pl-4 border-l ml-4 border-border/50">
                        <p className="text-lg font-black">{site.cost.toLocaleString()}</p>
                        <p className="text-[9px] font-black uppercase text-muted-foreground">Tokens</p>
                      </div>
                   </div>
                 ))}
              </div>
           </ScrollArea>
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
        
      {/* --- DETAILED RAW ACTIVITY TABLE --- */}
      <Card className="shadow-2xl border-none bg-card">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
          <div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Raw Activity Cloud</CardTitle>
            <CardDescription>Live processing feed from the global scraper network</CardDescription>
          </div>
          <Badge variant="outline" className="h-8 font-black px-4 bg-muted/50 border-primary/20">{filteredData.length} ACTIVE RECORDS</Badge>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-black text-[10px] uppercase">Domain</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Node</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-right">Depth</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-right">Intensity (T/Pg)</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-right">Total Tokens</TableHead>
                  <TableHead className="font-black text-[10px] uppercase text-right">Time (UTC)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.slice(0, 50).map((row, i) => {
                  const total = row.input_tokens + row.output_tokens;
                  const intensity = Math.round(total / (row.pages_scraped || 1));
                  return (
                    <TableRow key={i} className="group hover:bg-primary/5 transition-colors border-b">
                      <TableCell className="font-black text-primary text-xs uppercase flex items-center gap-2">
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {row.base_url}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-black text-[9px] uppercase">{row.username}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-muted-foreground text-xs">{row.pages_scraped}</TableCell>
                      <TableCell className="text-right">
                         <span className={`text-[11px] font-black ${intensity > metrics.tPg ? 'text-red-500' : 'text-emerald-500'}`}>
                           {intensity.toLocaleString()}
                         </span>
                      </TableCell>
                      <TableCell className="text-right font-black text-xs">{total.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-[9px] font-bold text-muted-foreground uppercase">
                        {new Date(row.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkStats;