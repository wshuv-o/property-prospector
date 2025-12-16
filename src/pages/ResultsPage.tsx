import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
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
                          <TableCell className="text-sm">
                            {row.scraped_name || row.scraped_emails || row.scraped_numbers ? (
                              <div className="space-y-0.5">
                                {row.scraped_name && <div>{row.scraped_name}</div>}
                                {row.scraped_emails && <div className="text-muted-foreground">{row.scraped_emails}</div>}
                                {row.scraped_numbers && <div className="text-muted-foreground">{row.scraped_numbers}</div>}
                              </div>
                            ) : '-'}
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
