import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

const activityLogs = [
  {
    id: '1',
    type: 'search',
    status: 'completed',
    address: '2009 Alston Ave, Fort Worth, TX 76110',
    resultsCount: 3,
    timestamp: '2 minutes ago',
    duration: '4.2s',
  },
  {
    id: '2',
    type: 'search',
    status: 'completed',
    address: '2001 Alston Ave, Fort Worth, TX 76110',
    resultsCount: 2,
    timestamp: '5 minutes ago',
    duration: '3.8s',
  },
  {
    id: '3',
    type: 'bulk',
    status: 'completed',
    address: 'Bulk search (8 addresses)',
    resultsCount: 18,
    timestamp: '1 hour ago',
    duration: '2m 34s',
  },
  {
    id: '4',
    type: 'search',
    status: 'failed',
    address: '805 W Arlington Ave, Fort Worth, TX 76110',
    resultsCount: 0,
    timestamp: '2 hours ago',
    duration: '15.2s',
    error: 'Cloudflare challenge failed',
  },
  {
    id: '5',
    type: 'search',
    status: 'completed',
    address: '2011 Lipscomb St, Fort Worth, TX 76110',
    resultsCount: 4,
    timestamp: '3 hours ago',
    duration: '5.1s',
  },
];

const ActivityPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activity Log</h1>
          <p className="text-sm text-muted-foreground">
            Monitor search operations and system events
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Searches</CardDescription>
              <CardTitle className="text-3xl">156</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Success Rate</CardDescription>
              <CardTitle className="text-3xl text-success">94.2%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Response</CardDescription>
              <CardTitle className="text-3xl">4.3s</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Today's Searches</CardDescription>
              <CardTitle className="text-3xl">23</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your search history and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      log.status === 'completed' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {log.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{log.address}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {log.timestamp}
                        <span>•</span>
                        Duration: {log.duration}
                        {log.error && (
                          <>
                            <span>•</span>
                            <span className="text-destructive">{log.error}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={log.type === 'bulk' ? 'default' : 'secondary'}>
                      {log.type === 'bulk' ? 'Bulk' : 'Single'}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">{log.resultsCount} results</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ActivityPage;
