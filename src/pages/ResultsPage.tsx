// F:\Imtiaj Sajin\property-prospector\src\pages\ResultsPage.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Mail, 
  Phone, 
  Layers, 
  Star 
} from "lucide-react";
import { toast } from "sonner";
import { dataApi, DataRow } from "@/lib/api";

const ResultsPage = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const limit = 50;

  const fetchData = async () => {
    setLoading(true);
    const params: { status?: string; limit: number; offset: number } = {
      limit,
      offset: page * limit,
    };
    
    if (statusFilter !== "all") {
      params.status = statusFilter === "pending" ? "pending" : statusFilter;
    }
    
    const result = await dataApi.getAll(params);
    if (result.data) {
      setData(result.data.data);
      setTotal(result.data.total);
    } else if (result.error) {
      toast.error(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, page]);

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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Results</h1>
          <p className="text-muted-foreground mt-1">
            View all scraped data and their status
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
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
              No data found. Upload some entries first.
            </div>
          ) : (
            <>
              <div className="rounded-md border border-border/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Scraped Data</TableHead>
                        <TableHead>Scraped By</TableHead>
                        <TableHead>Batch</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-muted-foreground">{row.id}</TableCell>
                          <TableCell className="font-mono text-sm max-w-[200px] truncate">
                            {row.raw_address || '-'}
                          </TableCell>
                          <TableCell>{row.raw_name || '-'}</TableCell>
                          <TableCell>{getStatusBadge(row.status)}</TableCell>
                          {/* Find the TableCell under the "Scraped Data" column and replace it with this: */}

<TableCell className="py-3">
  {row.scraped_name || row.best_email || row.best_number || row.scraped_emails ? (
    <div className="flex flex-col gap-2 min-w-[250px]">
      
      {/* 1. Name Section */}
      {row.scraped_name && (
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800">
            <User className="h-3.5 w-3.5 text-slate-500" />
          </div>
          {row.scraped_name}
        </div>
      )}

      {/* 2. Best Data Section (Highlighted Badges) */}
      {(row.best_email || row.best_number) && (
        <div className="flex flex-wrap gap-2 mt-0.5">
          
          {/* Best Email - Green/Emerald Style */}
          {row.best_email && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
              <Mail className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">{row.best_email}</span>
              <Star className="h-3 w-3 fill-emerald-500 text-emerald-500 ml-1" />
            </div>
          )}

          {/* Best Number - Blue/Indigo Style */}
          {row.best_number && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
              <Phone className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">{row.best_number}</span>
              <Star className="h-3 w-3 fill-blue-500 text-blue-500 ml-1" />
            </div>
          )}
        </div>
      )}

      {/* 3. Raw/Other Data Section (Collapsible/Muted look) */}
      {((row.scraped_emails && row.scraped_emails !== row.best_email) || 
        (row.scraped_numbers && row.scraped_numbers !== row.best_number)) && (
        <div className="flex flex-col gap-1 mt-1 pl-1 border-l-2 border-slate-100 dark:border-slate-800">
          
          {/* Other Emails */}
          {row.scraped_emails && row.scraped_emails !== row.best_email && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Layers className="h-3 w-3 mt-0.5 opacity-50" />
              <span className="break-all line-clamp-2" title={row.scraped_emails}>
                All Emails: {row.scraped_emails}
              </span>
            </div>
          )}

          {/* Other Numbers */}
          {row.scraped_numbers && row.scraped_numbers !== row.best_number && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Layers className="h-3 w-3 mt-0.5 opacity-50" />
              <span className="break-all line-clamp-2" title={row.scraped_numbers}>
                All #s: {row.scraped_numbers}
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
                          
                          <TableCell>{row.scraped_by_name || '-'}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{row.batch || '-'}</TableCell>
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
