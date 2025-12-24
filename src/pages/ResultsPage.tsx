// F:\Imtiaj Sajin\property-prospector\src\pages\ResultsPage.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Database, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Mail, 
  Phone, 
  Layers, 
  Star,
  Clock,
  FileSpreadsheet,
  Settings2
} from "lucide-react";
import { toast } from "sonner";
import { dataApi, userApi, DataRow, User as UserType, Batch } from "@/lib/api";
import * as XLSX from "xlsx";

// Configuration for Excel Columns
const EXPORT_COLUMNS = [
  { id: "id", label: "ID" },
  { id: "raw_name", label: "Raw Name" },
  { id: "raw_address", label: "Raw Address" },
  { id: "profile_url", label: "Source URL" },
  { id: "fastpeoplesearch_url", label: "FastPeopleSearch URL" },
  { id: "truepeoplesearch_url", label: "TruePeopleSearch URL" },
  { id: "searchpeoplefree_url", label: "SearchPeopleFree URL" },
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
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  
  const [page, setPage] = useState(0);
  const limit = 50;

  // Export Settings
  const [selectedCols, setSelectedCols] = useState<string[]>(EXPORT_COLUMNS.map(c => c.id));

  const fetchData = async () => {
    setLoading(true);
    // Note: Ensure your dataApi.getAll in api.ts is updated to accept scraped_by
    const params: any = {
      limit,
      offset: page * limit,
      status: statusFilter === "all" ? undefined : statusFilter,
      batch: batchFilter === "all" ? undefined : batchFilter,
      scraped_by: userFilter === "all" ? undefined : userFilter
    };
    
    const result = await dataApi.getAll(params);
    if (result.data) {
      setData(result.data.data);
      setTotal(result.data.total);
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const fetchMetadata = async () => {
    const [uRes, bRes] = await Promise.all([userApi.getAll(), dataApi.getBatches()]);
    if (uRes.data) setUsers(uRes.data);
    if (bRes.data) setBatches(bRes.data);
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchData();
  }, [statusFilter, userFilter, batchFilter, page]);

  const handleExport = async () => {
    toast.info("Downloading full filtered data for Excel...");
    
    // Fetch all data based on current filters (ignoring pagination)
    const result = await dataApi.getAll({
      status: statusFilter === "all" ? undefined : statusFilter,
      batch: batchFilter === "all" ? undefined : batchFilter,
      scraped_by: userFilter === "all" ? undefined : userFilter,
      limit: 10000, 
      offset: 0
    } as any);

    if (!result.data || result.data.data.length === 0) {
      toast.error("No data found to export");
      return;
    }

    const exportData = result.data.data.map(row => {
      const obj: any = {};
      selectedCols.forEach(colId => {
        const colDef = EXPORT_COLUMNS.find(c => c.id === colId);
        if (colDef) obj[colDef.label] = (row as any)[colId] || "";
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scraped Results");
    XLSX.writeFile(wb, `scraped_results_${new Date().getTime()}.xlsx`);
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
    }
    switch (status) {
      case 'done':
        return <Badge className="bg-success/20 text-success border-success/30">Done</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (e) { return dateString; }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Results</h1>
          <p className="text-muted-foreground mt-1">
            View all scraped data and their status
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[130px]">
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
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map(u => (
                <SelectItem key={u.id} value={u.id.toString()}>{u.username}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Batch Filter */}
          <Select value={batchFilter} onValueChange={(v) => { setBatchFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map(b => (
                <SelectItem key={b.id} value={b.batch_code}>{b.batch_code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <div className="h-8 w-[1px] bg-border mx-1" />

          {/* Export Settings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="space-y-2">
                <p className="text-xs font-medium px-2 py-1 border-b">Select Export Columns</p>
                <div className="max-h-[300px] overflow-y-auto px-1">
                  {EXPORT_COLUMNS.map((col) => (
                    <div key={col.id} className="flex items-center space-x-2 p-1 hover:bg-muted rounded-sm">
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

          <Button onClick={handleExport} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data ({total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data found. Adjust your filters or upload entries first.
            </div>
          ) : (
            <>
              <div className="rounded-md border border-border/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-16 px-2">ID</TableHead>
                        <TableHead className="w-[180px] px-2">Address</TableHead>
                        <TableHead className="w-[150px] px-2">Name</TableHead>
                        {/* Status Column is now tight to its content */}
                        <TableHead className="w-[85px] px-1 text-center">Status</TableHead>
                        <TableHead className="w-[400px] px-2">Scraped Data</TableHead>
                        <TableHead className="w-[130px] px-2">Scraped By</TableHead>
                        <TableHead className="w-[140px] px-2">Scraped At</TableHead>
                        <TableHead className="w-[110px] px-2">Batch</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row) => (
                        <TableRow key={row.id} className="align-top">
                          <TableCell className="text-muted-foreground px-2 py-4">#{row.id}</TableCell>
                          
                          {/* Truncate removed, allowing multiple lines */}
                          <TableCell className="font-mono text-sm px-2 py-4 break-words">
                            {row.raw_address || '-'}
                          </TableCell>
                          
                          <TableCell className="px-2 py-4 break-words">
                            {row.raw_name || '-'}
                          </TableCell>
                          
                          <TableCell className="px-1 py-4 text-center">
                            {getStatusBadge(row.status)}
                          </TableCell>
                          
                          <TableCell className="py-4 px-2">
                            {row.scraped_name || row.best_email || row.best_number || row.scraped_emails ? (
                              <div className="flex flex-col gap-3">
                                
                                {row.scraped_name && (
                                  <div className="flex items-center gap-2 font-semibold text-foreground">
                                    <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0">
                                      <User className="h-3.5 w-3.5 text-slate-500" />
                                    </div>
                                    <span className="break-words">{row.scraped_name}</span>
                                  </div>
                                )}

                                {(row.best_email || row.best_number) && (
                                  <div className="flex flex-wrap gap-2 mt-0.5">
                                    {row.best_email && (
                                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        <span className="text-xs font-bold break-all">{row.best_email}</span>
                                        <Star className="h-3 w-3 fill-emerald-500 text-emerald-500 ml-1 shrink-0" />
                                      </div>
                                    )}

                                    {row.best_number && (
                                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                        <Phone className="h-3.5 w-3.5 shrink-0" />
                                        <span className="text-xs font-bold break-all">{row.best_number}</span>
                                        <Star className="h-3 w-3 fill-blue-500 text-blue-500 ml-1 shrink-0" />
                                      </div>
                                    )}
                                  </div>
                                )}

                                {((row.scraped_emails && row.scraped_emails !== row.best_email) || 
                                  (row.scraped_numbers && row.scraped_numbers !== row.best_number)) && (
                                  <div className="flex flex-col gap-2 mt-1 pl-1 border-l-2 border-slate-100 dark:border-slate-800">
                                    {row.scraped_emails && row.scraped_emails !== row.best_email && (
                                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <Layers className="h-3 w-3 mt-0.5 opacity-50 shrink-0" />
                                        <span className="break-all">
                                          Emails: {row.scraped_emails}
                                        </span>
                                      </div>
                                    )}
                                    {row.scraped_numbers && row.scraped_numbers !== row.best_number && (
                                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <Layers className="h-3 w-3 mt-0.5 opacity-50 shrink-0" />
                                        <span className="break-all">
                                          Numbers: {row.scraped_numbers}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50 text-sm">-</span>
                            )}
                          </TableCell>
                          
                          <TableCell className="px-2 py-4">
                            <div className="flex items-center gap-1.5 text-sm">
                              <User className="h-3.5 w-3.5 opacity-50" />
                              {row.scraped_by_name || '-'}
                            </div>
                          </TableCell>

                          <TableCell className="px-2 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 opacity-50" />
                              {formatDateTime(row.scraped_at)}
                            </div>
                          </TableCell>

                          <TableCell className="text-muted-foreground text-xs px-2 py-4 break-words">
                            {row.batch || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPage;