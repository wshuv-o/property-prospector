import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, MapPin, User } from 'lucide-react';
import type { ExcelRow } from '@/types/person';

interface DataPreviewProps {
  data: ExcelRow[];
}

export function DataPreview({ data }: DataPreviewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  
  if (data.length === 0) return null;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Uploaded Data</CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {data.length} records
            </Badge>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-7 px-2"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="h-7 px-2"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'table' ? (
          <ScrollArea className="h-[350px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-12 text-muted-foreground">#</TableHead>
                  <TableHead className="text-muted-foreground">Address</TableHead>
                  <TableHead className="text-muted-foreground">Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} className="border-border/30 hover:bg-accent/50 transition-colors">
                    <TableCell className="text-muted-foreground font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-mono text-sm">{row.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium">{row.name}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.map((row, index) => (
                <div
                  key={index}
                  className="group relative p-4 rounded-lg border border-border/50 bg-gradient-to-br from-background to-accent/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                >
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-xs bg-background/80">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="font-semibold text-foreground">{row.name}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground font-mono">{row.address}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}