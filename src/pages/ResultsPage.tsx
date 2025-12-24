import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { 
  Database, RefreshCw, ChevronLeft, ChevronRight, User, Mail, 
  Phone, Layers, Star, Clock, FileSpreadsheet, Settings2, ExternalLink, SortAsc
} from "lucide-react";
import { toast } from "sonner";
import { dataApi, userApi, DataRow, User as UserType, Batch } from "@/lib/api";
import * as XLSX from "xlsx";

const EXPORT_COLUMNS = [
  { id: "id", label: "ID" },
  { id: "raw_name", label: "Raw Name" },
  { id: "raw_address", label: "Raw Address" },
  { id: "profile_url", label: "Source URL" },
  { id: "status", label: "Status" },
  { id: "scraped_name", label: "Scraped Name" },
  { id: "best_email", label: "Best Email" },
  { id: "best_number", label: "Best Number" },
  { id: "scraped_emails", label: "All Emails" },
  { id: "scraped_numbers", label: "All Numbers" },
  { id: "scraped_by_name", label: "Scraped By" },
  { id: "scraped_at", label: "Scraped At" },
  { id: "batch", label: "Batch Code" },
];

const ResultsPage = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 50;

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");

  // Intelligent Display Settings
  const [topX, setTopX] = useState<number>(3); // How many to show
  const [sortMethod, setSortMethod] = useState<"default" | "nameMatch">("nameMatch");
  const [selectedCols, setSelectedCols] = useState<string[]>(EXPORT_COLUMNS.map(c => c.id));

  // Intelligent Email Processing Function
  const processList = (rawString: string | null, name: string | null, type: 'email' | 'phone') => {
    if (!rawString) return [];
    let items = rawString.split(',').map(s => s.trim()).filter(Boolean);

    if (type === 'email' && sortMethod === 'nameMatch' && name) {
      const nameParts = name.toLowerCase().split(/\s+/).filter(p => p.length > 2);
      items.sort((a, b) => {
        const aMatch = nameParts.some(part => a.toLowerCase().includes(part)) ? 1 : 0;
        const bMatch = nameParts.some(part => b.toLowerCase().includes(part)) ? 1 : 0;
        return bMatch - aMatch; // Matches go to index 0
      });
    }

    return items.slice(0, topX);
  };

  const fetchData = async () => {
    setLoading(true);
    const result = await dataApi.getAll({
      limit,
      offset: page * limit,
      status: statusFilter,
      batch: batchFilter,
      scraped_by: userFilter
    });
    if (result.data) {
      setData(result.data.data);
      setTotal(result.data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadMetadata = async () => {
      const [u, b] = await Promise.all([userApi.getAll(), dataApi.getBatches()]);
      if (u.data) setUsers(u.data);
      if (b.data) setBatches(b.data);
    };
    loadMetadata();
  }, []);

  useEffect(() => { fetchData(); }, [statusFilter, userFilter, batchFilter, page]);

  const handleExport = async () => {
    toast.info("Preparing Excel Export...");
    const result = await dataApi.getAll({ 
      status: statusFilter, batch: batchFilter, scraped_by: userFilter, limit: 5000 
    });
    
    if (!result.data) return;

    const exportData = result.data.data.map(row => {
      const obj: any = {};
      selectedCols.forEach(colId => {
        const colDef = EXPORT_COLUMNS.find(c => c.id === colId);
        if (!colDef) return;
        
        // Apply Top X logic even to Excel if desired
        let value = (row as any)[colId];
        if (colId === 'scraped_emails' || colId === 'scraped_numbers') {
          value = processList(value, row.scraped_name, colId === 'scraped_emails' ? 'email' : 'phone').join(', ');
        }
        obj[colDef.label] = value || "";
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");
    XLSX.writeFile(wb, `Prospects_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Results</h1>
          <p className="text-muted-foreground text-sm">Review, filter, and export scraped property data.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Scraped By" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.username}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Batch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map(b => <SelectItem key={b.id} value={b.batch_code}>{b.batch_code}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchData} className="h-9 w-9">
            <RefreshCw className="h-4 w-4" />
          </Button>

          <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block" />

          {/* Intelligent Controls Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <SortAsc className="h-4 w-4" /> Display Logic
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 space-y-4" align="end">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Email Sorting</label>
                <Select value={sortMethod} onValueChange={(v: any) => setSortMethod(v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default (Source order)</SelectItem>
                    <SelectItem value="nameMatch">Intelligent (Name Match)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Show Top Results</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={topX} 
                    onChange={(e) => setTopX(Number(e.target.value))} 
                    className="h-8 w-20 text-xs"
                    min={1} max={50}
                  />
                  <span className="text-[10px] text-muted-foreground italic">per record</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2"><Settings2 className="h-4 w-4" />Columns</Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="max-h-60 overflow-y-auto">
                {EXPORT_COLUMNS.map(col => (
                  <div key={col.id} className="flex items-center space-x-2 p-1 hover:bg-muted rounded text-xs cursor-pointer">
                    <Checkbox id={col.id} checked={selectedCols.includes(col.id)} onCheckedChange={(c) => setSelectedCols(p => c ? [...p, col.id] : p.filter(x => x !== col.id))} />
                    <label htmlFor={col.id} className="flex-1 cursor-pointer">{col.label}</label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={handleExport} size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </Button>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[60px] text-xs font-bold px-3">ID</TableHead>
                  <TableHead className="w-[220px] text-xs font-bold">Property Details</TableHead>
                  <TableHead className="w-[80px] text-xs font-bold text-center px-1">Status</TableHead>
                  <TableHead className="min-w-[400px] text-xs font-bold">Scraped Data Intelligence</TableHead>
                  <TableHead className="w-[120px] text-xs font-bold text-center">Source</TableHead>
                  <TableHead className="w-[180px] text-xs font-bold">Worker Info</TableHead>
                  <TableHead className="w-[100px] text-xs font-bold">Batch</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Fetching records...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No data found matching these filters.</TableCell></TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.id} className="align-top hover:bg-muted/20">
                      <TableCell className="text-xs font-mono text-muted-foreground px-3 py-4">#{row.id}</TableCell>
                      
                      {/* MERGED CELL: Name & Address */}
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-sm leading-tight text-foreground">{row.raw_name || 'No Name'}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed italic">{row.raw_address}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-center py-4 px-1">
                        {row.status === 'done' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold px-1.5 py-0 uppercase">Done</Badge>
                        ) : row.status === 'error' ? (
                          <Badge variant="destructive" className="text-[10px] font-bold px-1.5 py-0 uppercase">Error</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 uppercase">Pending</Badge>
                        )}
                      </TableCell>
                      
                      {/* INTELLIGENT CELL: Processed Emails/Numbers */}
                      <TableCell className="py-4">
                        <div className="space-y-4">
                          {row.scraped_name && (
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-0.5 rounded text-xs font-medium">
                              <User className="h-3 w-3" /> {row.scraped_name}
                            </div>
                          )}

                          <div className="grid grid-cols-1 gap-3">
                            {/* Emails */}
                            <div className="space-y-1.5">
                              {(row.best_email || row.scraped_emails) ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {/* Best Email First */}
                                  {row.best_email && (
                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-bold">
                                      <Mail className="h-3 w-3" /> {row.best_email} <Star className="h-2.5 w-2.5 fill-current" />
                                    </div>
                                  )}
                                  {/* Top Scraped Emails */}
                                  {processList(row.scraped_emails, row.scraped_name, 'email')
                                    .filter(email => email !== row.best_email)
                                    .map((email, i) => (
                                      <div key={i} className="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded text-[11px] text-muted-foreground border border-transparent">
                                        <Mail className="h-3 w-3 opacity-50" /> {email}
                                      </div>
                                    ))}
                                </div>
                              ) : <p className="text-[10px] text-muted-foreground">No emails found</p>}
                            </div>

                            {/* Numbers */}
                            <div className="space-y-1.5">
                              {(row.best_number || row.scraped_numbers) ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {row.best_number && (
                                    <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-bold">
                                      <Phone className="h-3 w-3" /> {row.best_number} <Star className="h-2.5 w-2.5 fill-current" />
                                    </div>
                                  )}
                                  {processList(row.scraped_numbers, null, 'phone')
                                    .filter(n => n !== row.best_number)
                                    .map((num, i) => (
                                      <div key={i} className="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded text-[11px] text-muted-foreground">
                                        <Phone className="h-3 w-3 opacity-50" /> {num}
                                      </div>
                                    ))}
                                </div>
                              ) : <p className="text-[10px] text-muted-foreground">No numbers found</p>}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* SOURCE URL CELL */}
                      <TableCell className="py-4 text-center">
                        {row.profile_url ? (
                          <a 
                            href={row.profile_url} 
                            target="_blank" 
                            className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium"
                          >
                            Source <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : <span className="text-muted-foreground text-xs">-</span>}
                      </TableCell>
                      
                      {/* MERGED CELL: Worker & Time */}
                      <TableCell className="py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary">
                              {row.scraped_by_name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            {row.scraped_by_name || 'System'}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pl-1">
                            <Clock className="h-3 w-3" /> 
                            {row.scraped_at ? new Date(row.scraped_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <Badge variant="outline" className="text-[10px] font-mono opacity-70">
                          {row.batch || '-'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modern Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-muted-foreground italic">
          Total results: <b>{total}</b> • Page {page + 1} of {Math.ceil(total / limit)}
        </p>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => setPage(0)} disabled={page === 0} className="h-8">First</Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0} className="h-8">Prev</Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit) - 1} className="h-8">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;