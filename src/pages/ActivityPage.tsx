import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Database, TrendingUp, RefreshCw, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { dataApi, Stats } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const ActivityPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  // Filter state
  const [selectedUser, setSelectedUser] = useState<string>("all");

  const fetchStats = async () => {
    setLoading(true);
    const result = await dataApi.getStats();
    if (result.data) {
      setStats(result.data);
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground animate-pulse">Loading statistics...</p>
      </div>
    );
  }

  // Prepare Chart Data
  const chartData = stats?.byDate?.slice(0, 14).reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    completed: d.completed,
    errors: d.errors,
  })) || [];

  // Filter Performance Data based on Username selection
  const filteredPerformance = stats?.performance.filter(item => 
    selectedUser === "all" ? true : item.username === selectedUser
  ) || [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor scraping progress, daily stats, and team performance.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} className="w-fit">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* --- Section 1: Top Level Stats (Lifetime & Today) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Database */}
        <Card className="bg-gradient-to-br from-card to-accent/10 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Database</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{stats?.overall?.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Database className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Queue */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Queue</p>
                <span className="text-3xl font-bold">{stats?.overall?.pending.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TODAY'S PERFORMANCE (New) */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Completed Today</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                    +{stats?.today?.completed.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Errors */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lifetime Errors</p>
                <span className="text-3xl font-bold">{stats?.overall?.errors.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-destructive/10 rounded-xl">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        
        {/* --- Section 2: User Performance Table (New Feature) --- */}
        <Card className="md:col-span-4 border-border/50 flex flex-col h-[500px]">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Performance Log
              </CardTitle>
              <CardDescription>Breakdown by Date and User</CardDescription>
            </div>
            
            {/* USER FILTER DROPDOWN */}
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {stats?.users.map((u, i) => (
                  <SelectItem key={i} value={u.username}>{u.username}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent className="flex-1 overflow-auto pr-2">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                  <TableHead className="text-right">Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPerformance.length > 0 ? (
                  filteredPerformance.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(row.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Badge variant="outline" className="font-normal">
                          {row.username}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-success">
                        {row.completed}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        {row.errors > 0 ? row.errors : '-'}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {row.completed + row.errors} total
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No activity found for this filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* --- Section 3: Visual Chart --- */}
        <Card className="md:col-span-3 border-border/50 h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              14 Day Trend
            </CardTitle>
            <CardDescription>Daily completion vs errors</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  className="text-xs text-muted-foreground" 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  className="text-xs text-muted-foreground" 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar 
                  dataKey="completed" 
                  name="Success" 
                  fill="hsl(var(--success))" 
                  radius={[4, 4, 0, 0]} 
                  stackId="a"
                />
                <Bar 
                  dataKey="errors" 
                  name="Error" 
                  fill="hsl(var(--destructive))" 
                  radius={[4, 4, 0, 0]} 
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* --- Section 4: Recent Batches --- */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Recent Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Batch Code</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.batches.map((batch, i) => {
                   const progress = Math.round(((batch.completed + batch.errors) / batch.total_rows) * 100) || 0;
                   return (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-sm">{batch.batch_code}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-500" 
                              style={{ width: `${progress}%` }} 
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        <span className="text-success font-medium">{batch.completed}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-muted-foreground">{batch.total_rows}</span>
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

export default ActivityPage;