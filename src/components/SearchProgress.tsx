// src\components\SearchProgress.tsx
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SearchResult } from '@/types/person';

interface SearchProgressProps {
  results: SearchResult[];
  totalCount: number;
}

const statusIcons = {
  pending: <Circle className="h-4 w-4 text-muted-foreground" />,
  searching: <Loader2 className="h-4 w-4 text-primary animate-spin" />,
  completed: <CheckCircle2 className="h-4 w-4 text-success" />,
  error: <XCircle className="h-4 w-4 text-destructive" />,
};

export function SearchProgress({ results, totalCount }: SearchProgressProps) {
  const completed = results.filter(r => r.status === 'completed').length;
  const errors = results.filter(r => r.status === 'error').length;
  const searching = results.filter(r => r.status === 'searching').length;
  const progressValue = totalCount > 0 ? ((completed + errors) / totalCount) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Search Progress</span>
          <span className="text-sm font-normal text-muted-foreground">
            {completed}/{totalCount} completed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressValue} className="h-2" />
        
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span>{completed} completed</span>
          </div>
          {searching > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
              <span>{searching} in progress</span>
            </div>
          )}
          {errors > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span>{errors} errors</span>
            </div>
          )}
        </div>

        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                {statusIcons[result.status]}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{result.query.address}</p>
                  {result.error && (
                    <p className="text-xs text-destructive">{result.error}</p>
                  )}
                </div>
                {result.status === 'completed' && (
                  <span className="text-xs text-muted-foreground">
                    {result.results.length} found
                  </span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
