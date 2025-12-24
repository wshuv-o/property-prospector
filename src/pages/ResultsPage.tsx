import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Database, RefreshCw, ChevronLeft, ChevronRight, User, Mail, 
  Phone, Layers, Star, Clock, FileSpreadsheet, Settings2 
} from "lucide-react";
import { toast } from "sonner";
import { dataApi, userApi, DataRow, User as UserType, Batch } from "@/lib/api";
import * as XLSX from "xlsx";

// Column definitions for Export
const EXPORT_COLUMNS = [
  { id: "id", label: "ID" },
  { id: "raw_name", label: "Raw Name" },
  { id: "raw_address", label: "Raw Address" },
  { id: "profile_url", label: "Source URL" },
  { id: "fastpeoplesearch_url", label: "FastPeopleSearch URL" },
  { id: "truepeoplesearch_url", label: "TruePeopleSearch URL" },
  { id: "searchpeoplefree_url", label: "SearchPeopleFree URL" },
  { id: "scrapped_from", label: "Scraped From (ID)" },
  { id: "scrapped_from_name", label: "Scraped From (Site)" },
  { id: "status", label: "Status" },
  { id: "scraped_name", label: "Scraped Name" },
  { id: "scraped_emails", label: "Scraped Emails" },
  { id: "scraped_numbers", label: "Scraped Numbers" },
  { id: "best_email", label: "Best Email" },
  { id: "best_number", label: "Best Number" },
  { id: "batch", label: "Batch" },
  { id: "scraped_by_name", label: "Scraped By" },
  { id: "scraped_at", label: "Scraped At" },
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

  // Excel Export Config
  const [selectedCols, setSelectedCols] = useState<string[]>(EXPORT_COLUMNS.map(c => c.id));

  const fetchData = async () => {
    setLoading(true);
    const params = {
      limit,
      offset: page * limit,
      status: statusFilter,
      batch: batchFilter,
      scraped_by: userFilter, // Requires the backend update provided above
    };
    
    const result = await dataApi.getAll(params as any);
    if (result.data) {
      setData(result.data.data);
      setTotal(result.data.total);
    }
    setLoading(false);
  };

  const fetchFilters = async () => {
    const [uRes, bRes] = await Promise.all([userApi.getAll(), dataApi.getBatches()]);
    if (uRes.data) setUsers(uRes.data);
    if (bRes.data) setBatches(bRes.data);
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchData();
  }, [statusFilter, userFilter, batchFilter, page]);

  const handleExport = async () => {
    toast.info("Preparing export based on current filters...");
    
    // Fetch ALL filtered data (ignoring pagination limit for export)
    const result = await dataApi.getAll({
      status: statusFilter,
      batch: batchFilter,
      scraped_by: userFilter,
      limit: 10000, 
      offset: 0
    } as any);

    if (!result.data || result.data.data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const siteMap: Record<number, string> = { 1: "FastPeopleSearch", 2: "TruePeopleSearch", 3: "SearchPeopleFree" };

    const exportData = result.data.data.map(row => {
      const obj: any = {};
      selectedCols.forEach(colId => {
        const colDef = EXPORT_COLUMNS.find(c => c.id === colId);
        if (!colDef) return;

        if (colId === 'scrapped_from_name') {
          obj[colDef.label] = siteMap[row.scrapped_from as number] || 'Unknown';
        } else {
          obj[colDef.label] = (row as any)[colId] || "";
        }
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scraped Results");
    XLSX.writeFile(wb, `results_${new Date().getTime()}.xlsx`);
    toast.success("Excel file downloaded");
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline" className="text-[10px] uppercase font-bold px-1.5 py-0">Pending</Badge>;
    switch (status) {
      case 'done': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase font-bold px-1.5 py-0">Done</Badge>;
      case 'error': return <Badge variant="destructive" className="text-[10px] uppercase font-bold px-1.5 py-0">Error</Badge>;
      default: return <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground text-sm">Manage and export your property prospecting data.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[110px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          {/* User Filter */}
          <Select value={userFilter} onValueChange={(v) => { setUserFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.username}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Batch Filter */}
          <Select value={batchFilter} onValueChange={(v) => { setBatchFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map(b => <SelectItem key={b.id} value={b.batch_code}>{b.batch_code}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={fetchData} className="h-9 w-9">
            <RefreshCw className="h-4 w-4" />
          </Button>

          <div className="h-6 w-[1px] bg-border mx-1" />

          {/* Column Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Settings2 className="h-4 w-4" />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="space-y-2">
                <p className="text-xs font-medium px-2 py-1 border-b">Export Columns</p>
                <div className="max-h-[300px] overflow-y-auto px-1">
                  {EXPORT_COLUMNS.map((col) => (
                    <div key={col.id} className="flex items-center space-x-2 p-1 hover:bg-muted rounded-sm transition-colors">
                      <Checkbox 
                        id={col.id} 
                        checked={selectedCols.includes(col.id)} 
                        onCheckedChange={(checked) => {
                          setSelectedCols(prev => checked ? [...prev, col.id] : prev.filter(i => i !== col.id))
                        }}
                      />
                      <label htmlFor={col.id} className="text-xs cursor-pointer flex-1">{col.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={handleExport} size="sm" className="h-9 gap-2 bg-emerald-600 hover:bg-emerald-700">
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[60px] px-3 py-3 text-xs font-bold uppercase">ID</TableHead>
                  <TableHead className="w-[200px] px-2 py-3 text-xs font-bold uppercase">Name / Address</TableHead>
                  <TableHead className="w-[75px] px-2 py-3 text-xs font-bold uppercase text-center">Status</TableHead>
                  <TableHead className="min-w-[300px] px-2 py-3 text-xs font-bold uppercase">Scraped Information</TableHead>
                  <TableHead className="w-[130px] px-2 py-3 text-xs font-bold uppercase">Timestamp</TableHead>
                  <TableHead className="w-[100px] px-2 py-3 text-xs font-bold uppercase">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">Loading dataset...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">No records found.</TableCell></TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.id} className="group hover:bg-muted/30 transition-colors align-top">
                      <TableCell className="px-3 py-4 text-xs font-mono text-muted-foreground">#{row.id}</TableCell>
                      
                      <TableCell className="px-2 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm leading-snug break-words">{row.raw_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground break-words leading-relaxed">{row.raw_address}</p>
                          <div className="flex gap-1 pt-1">
                             <Badge variant="outline" className="text-[9px] h-4 px-1 font-normal opacity-70">Batch: {row.batch}</Badge>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-2 py-4 text-center">
                        {getStatusBadge(row.status)}
                      </TableCell>
                      
                      <TableCell className="px-2 py-4">
                        <div className="space-y-3">
                          {/* Top row: Name & Best contact */}
                          <div className="flex flex-wrap gap-2">
                             {row.scraped_name && (
                                <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded text-xs font-medium">
                                   <User className="h-3 w-3" /> {row.scraped_name}
                                </div>
                             )}
                             {row.best_email && (
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold border border-emerald-500/20">
                                   <Mail className="h-3 w-3" /> {row.best_email} <Star className="h-2.5 w-2.5 fill-current" />
                                </div>
                             )}
                             {row.best_number && (
                                <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">
                                   <Phone className="h-3 w-3" /> {row.best_number} <Star className="h-2.5 w-2.5 fill-current" />
                                </div>
                             )}
                          </div>

                          {/* Raw Lists */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                             {row.scraped_emails && row.scraped_emails !== row.best_email && (
                               <div className="space-y-1">
                                  <p className="text-muted-foreground font-bold flex items-center gap-1 uppercase tracking-tighter"><Layers className="h-3 w-3" /> All Emails</p>
                                  <p className="break-all text-muted-foreground/80 leading-normal">{row.scraped_emails}</p>
                               </div>
                             )}
                             {row.scraped_numbers && row.scraped_numbers !== row.best_number && (
                               <div className="space-y-1">
                                  <p className="text-muted-foreground font-bold flex items-center gap-1 uppercase tracking-tighter"><Layers className="h-3 w-3" /> All Numbers</p>
                                  <p className="break-all text-muted-foreground/80 leading-normal">{row.scraped_numbers}</p>
                               </div>
                             )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="px-2 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {row.scraped_at ? new Date(row.scraped_at).toLocaleDateString() : 'N/A'}
                          </div>
                          <p className="text-[10px] text-muted-foreground pl-4.5">
                            {row.scraped_at ? new Date(row.scraped_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] pt-1 text-muted-foreground">
                            <User className="h-3 w-3" /> {row.scraped_by_name || 'System'}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-2 py-4">
                         <div className="text-[10px] font-mono text-muted-foreground space-y-1">
                            <p className="truncate hover:text-primary transition-colors cursor-help" title={row.profile_url || ''}>
                               {row.scrapped_from === 1 ? 'FastPeople' : row.scrapped_from === 2 ? 'TruePeople' : 'SearchPeople'}
                            </p>
                            <a href={row.profile_url || '#'} target="_blank" className="text-primary hover:underline block">View Profile</a>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-muted-foreground">
          Showing <strong>{page * limit + 1}</strong> to <strong>{Math.min((page + 1) * limit, total)}</strong> of <strong>{total}</strong> entries
        </p>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => setPage(0)} disabled={page === 0} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /><ChevronLeft className="h-4 w-4 -ml-2" /></Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="h-8 gap-1 px-2">Previous</Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit) - 1} className="h-8 gap-1 px-2">Next</Button>
          <Button variant="outline" size="sm" onClick={() => setPage(Math.ceil(total / limit) - 1)} disabled={page >= Math.ceil(total / limit) - 1} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /><ChevronRight className="h-4 w-4 -ml-2" /></Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;